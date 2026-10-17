// =====================================================================
//  EN LIGNE — comptes et sauvegardes sur Supabase
//  Chaque joueur a une ligne dans la table « accounts » avec toute sa
//  progression (data). Chacun peut lire les autres (pour les combats,
//  la guerre, le classement) mais ne peut modifier que la sienne.
// =====================================================================
import { SUPABASE_URL, SUPABASE_KEY } from './config.js?v=20261017174919';

export const online = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const MAX_PLAYERS = 8;

const SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
let sb = null;
let userId = null;
let pending = null;
let timer = null;
let onSaveError = () => {};

async function client() {
  if (!sb) {
    const { createClient } = await import(SDK);
    sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  }
  return sb;
}

// Supabase demande un e-mail : on en fabrique un à partir du pseudo (aucun mail n'est envoyé).
const slug = (p) => p.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const emailOf = (pseudo) => `${slug(pseudo)}@joueurs.fuze-arena.app`;

function frError(e) {
  const m = (e && e.message) || String(e);
  if (/invalid login credentials/i.test(m)) return 'Pseudo ou mot de passe incorrect.';
  if (/already registered|already exists|duplicate key/i.test(m)) return 'Ce pseudo est déjà pris.';
  if (/at least 6 characters/i.test(m)) return 'Le mot de passe doit faire au moins 6 caractères.';
  if (/complet/i.test(m)) return `Le jeu est complet (${MAX_PLAYERS} joueurs maximum).`;
  if (/failed to fetch|network/i.test(m)) return 'Pas de connexion internet.';
  if (/email not confirmed/i.test(m)) return 'Compte pas encore activé (confirmation e-mail activée dans Supabase).';
  return 'Erreur : ' + m;
}

export function setSaveErrorHandler(fn) { onSaveError = fn; }

/** Nombre de joueurs déjà inscrits (lisible sans être connecté) */
export async function playerCount() {
  const c = await client();
  const { data, error } = await c.rpc('player_count');
  if (error) return 0;
  return data || 0;
}

export async function signUp(pseudo, password, data) {
  if (!slug(pseudo)) throw new Error('Pseudo invalide : utilise des lettres ou des chiffres.');
  const c = await client();
  if ((await playerCount()) >= MAX_PLAYERS) throw new Error(frError('complet'));
  const { data: au, error } = await c.auth.signUp({ email: emailOf(pseudo), password });
  if (error) throw new Error(frError(error));
  if (!au.session) throw new Error('Compte créé, mais il faut désactiver « Confirm email » dans Supabase.');
  userId = au.user.id;
  const { error: e2 } = await c.from('accounts').insert({ id: userId, pseudo, data });
  if (e2) { await c.auth.signOut(); throw new Error(frError(e2)); }
  return { id: userId, pseudo, data };
}

/** Connexion. Renvoie { id, pseudo, data } ou { id, pseudo, data: null } si le compte n'a pas encore de personnage. */
export async function signIn(pseudo, password) {
  const c = await client();
  const { data: au, error } = await c.auth.signInWithPassword({ email: emailOf(pseudo), password });
  if (error) throw new Error(frError(error));
  userId = au.user.id;
  return fetchMine(pseudo);
}

async function fetchMine(fallbackPseudo = '') {
  const c = await client();
  const { data, error } = await c.from('accounts').select('id, pseudo, data').eq('id', userId).maybeSingle();
  if (error) throw new Error(frError(error));
  return data || { id: userId, pseudo: fallbackPseudo, data: null };
}

/** Crée la ligne du compte si elle manque (inscription interrompue) */
export async function createRow(pseudo, data) {
  const c = await client();
  const { error } = await c.from('accounts').insert({ id: userId, pseudo, data });
  if (error) throw new Error(frError(error));
}

/** Reprend la session enregistrée sur ce téléphone */
export async function restore() {
  const c = await client();
  const { data: { session } } = await c.auth.getSession();
  if (!session) return null;
  userId = session.user.id;
  return fetchMine();
}

/** Les autres joueurs (pour l'arène, la guerre et le classement) */
export async function fetchOthers() {
  const c = await client();
  const { data, error } = await c.from('accounts').select('id, pseudo, data').neq('id', userId);
  if (error) throw new Error(frError(error));
  return (data || []).filter(p => p.data && p.data.heroes);
}

/** Sauvegarde (regroupée pour ne pas envoyer à chaque clic) */
export function queueSave(acc) {
  pending = acc;
  clearTimeout(timer);
  timer = setTimeout(flush, 800);
}

export async function flush() {
  if (!pending || !userId) return;
  const data = JSON.parse(JSON.stringify(pending));
  pending = null;
  try {
    const c = await client();
    const { error } = await c.from('accounts').update({ data, updated_at: new Date().toISOString() }).eq('id', userId);
    if (error) throw error;
  } catch (e) {
    onSaveError(frError(e));
    if (!pending) pending = data;
    clearTimeout(timer);
    timer = setTimeout(flush, 5000);
  }
}

export async function signOut() {
  await flush();
  await unsubscribeChat();
  const c = await client();
  await c.auth.signOut();
  userId = null;
}

// ------------------------------ Tchat ------------------------------
export async function fetchMessages(limit = 60) {
  const c = await client();
  const { data, error } = await c.from('messages').select('id, user_id, pseudo, text, created_at').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(frError(error));
  return (data || []).reverse();
}

export async function sendMessage(pseudo, text) {
  const c = await client();
  const { data, error } = await c.from('messages').insert({ user_id: userId, pseudo, text }).select('id, user_id, pseudo, text, created_at').single();
  if (error) throw new Error(frError(error));
  return data;
}

let chatChannel = null;
/** Reçoit les nouveaux messages en direct */
export async function subscribeChat(onMessage) {
  const c = await client();
  if (chatChannel) await c.removeChannel(chatChannel);
  chatChannel = c.channel('tchat')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => onMessage(payload.new))
    .subscribe();
}

export async function unsubscribeChat() {
  if (!chatChannel) return;
  const c = await client();
  await c.removeChannel(chatChannel);
  chatChannel = null;
}

export const myId = () => userId;

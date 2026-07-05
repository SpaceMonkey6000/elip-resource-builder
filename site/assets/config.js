/* ============================================================
   elip resources — configuration
   ------------------------------------------------------------
   1. Create a project at https://supabase.com
   2. Run schema.sql (SQL Editor) to create the `leads` table
   3. Settings → API → paste your Project URL + anon public key below
   4. Replace the WhatsApp links with your real community invites
   ------------------------------------------------------------
   Note: the anon key is SAFE to expose in the browser. Row Level
   Security (from schema.sql) only allows inserts, never reads.
   ============================================================ */

window.ELIP_CONFIG = {
  // ---- Supabase ----
  SUPABASE_URL:      'YOUR_SUPABASE_URL',        // e.g. https://abcdefgh.supabase.co
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',   // e.g. eyJhbGciOiJIUzI1NiI...

  // ---- WhatsApp community ----
  // Default invite link, used everywhere unless overridden per-track below.
  WHATSAPP_COMMUNITY_URL: 'https://chat.whatsapp.com/YOUR_INVITE_CODE',

  // Optional: a separate group per track. Leave a value blank to fall back
  // to WHATSAPP_COMMUNITY_URL. Keys must match each page's data-source.
  WHATSAPP_LINKS: {
    swe:        '',
    pm:         '',
    consulting: '',
    analyst:    ''
  },

  // ---- The Elip agent (product) ----
  ELIP_AGENT_URL: 'https://tryelip.ai'
};

/* Helper: resolve the right WhatsApp link for a given track/source. */
window.ELIP_CONFIG.whatsappFor = function (source) {
  var c = window.ELIP_CONFIG;
  var override = c.WHATSAPP_LINKS && c.WHATSAPP_LINKS[source];
  return (override && override.trim()) ? override : c.WHATSAPP_COMMUNITY_URL;
};

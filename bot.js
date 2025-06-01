'use strict';

require('dotenv').config();

const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');
const app = express();

const CONFIG = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  GAS_URL: process.env.GAS_URL
};

console.log('🔒 Token cargado:', CONFIG.TELEGRAM_TOKEN?.slice(0, 10) + '...');
if (!CONFIG.TELEGRAM_TOKEN) {
  console.error('❌ TELEGRAM_TOKEN no definido en el entorno. Revisa las variables en Render.');
  process.exit(1);
}

const bot = new Telegraf(CONFIG.TELEGRAM_TOKEN);

const FIELD_MAP = {
  empresa: { synonyms: ['empresa', 'compania', 'proveedor'], required: true },
  nombre: { synonyms: ['nombre', 'cliente', 'name'], required: true },
  rut: { synonyms: ['rut', 'identificacion', 'dni'], required: true, format: formatRut },
  telefono: { synonyms: ['telefono', 'fono', 'celular', 'contacto'] },
  correo: { synonyms: ['correo', 'email', 'mail'], format: v => v.toLowerCase() },
  direccion: { synonyms: ['direccion', 'domicilio', 'address', 'calle'] },
  comuna: { synonyms: ['comuna', 'ciudad'] },
  region: { synonyms: ['region', 'provincia'] },
  plan: { synonyms: ['plan', 'servicio'] },
  deco: { synonyms: ['deco', 'equipo', 'adicional'] },
  obs: { synonyms: ['obs', 'observacion', 'nota'] },
  ejecutivo: { synonyms: ['ejecutivo', 'vendedor', 'asesor'] },
  supervisor: { synonyms: ['supervisor', 'encargado'] },
  serie: { synonyms: ['serie', 'serial'] },
  zsmart: { synonyms: ['zsmart', 'codigo z'] },
  estado: { synonyms: ['estado', 'situacion'] },
  lider: { synonyms: ['jefe', 'monitor'] }
};

function formatRut(rut) {
  if (!rut) return '';
  const cleanRut = rut.toString()
    .toUpperCase()
    .replace(/[^0-9K]/g, '')
    .replace(/^0+/, '');
  if (cleanRut.length < 2) return rut;
  return `${cleanRut.slice(0, -1)}-${cleanRut.slice(-1)}`;
}

bot.on('text', async (ctx) => {
  try {
    const mensaje = ctx.message.text;
    if (!mensaje || !mensaje.toLowerCase().includes('venta')) return;

    const ventaData = parseMessage(mensaje);
    validateData(ventaData);

    const response = await axios.post(CONFIG.GAS_URL, ventaData);
    await ctx.reply(response.data.message || '✅ Registro exitoso');
  } catch (error) {
    console.error('Error en mensaje:', error);
    const errorMsg = error.response?.data?.message || error.message || 'Error al procesar la solicitud';
    await ctx.reply(`⚠️ ${errorMsg}`);
  }
});

function parseMessage(text) {
  const result = {};
  const lines = text.split('\n');

  const lowerText = text.toLowerCase();
  if (lowerText.includes('entel')) result.empresa = 'ENTEL';
  else if (lowerText.includes('vtr')) result.empresa = 'VTR';
  else if (lowerText.includes('wom')) result.empresa = 'WOM';

  lines.forEach(line => {
    const match = line.match(/^\s*[•\-*]*\s*([^:]+):\s*(.+)/i);
    if (!match) return;

    const rawKey = match[1].trim().toLowerCase();
    const rawValue = match[2].trim();

    for (const [field, config] of Object.entries(FIELD_MAP)) {
      if (config.synonyms.some(syn => rawKey.includes(syn))) {
        result[field] = config.format ? config.format(rawValue) : rawValue.toUpperCase();
        break;
      }
    }
  });

  return result;
}

function validateData(data) {
  return;
}

bot.launch();

console.log('🤖✅ Bot iniciado correctamente con Telegraf. Esperando mensajes...');

app.get('/', (req, res) => {
  res.send('✅ Bot activo');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Servidor web Express escuchando para keep-alive');
});


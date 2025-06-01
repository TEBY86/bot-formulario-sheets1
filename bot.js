


'use strict';

require('dotenv').config(); // ✅ Cargar variables desde .env
const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express'); // ✅ Agregado para usar con UptimeRobot
const app = express();

// ✅ Configuración desde variables de entorno
const CONFIG = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  GAS_URL: process.env.GAS_URL
};

// Inicialización del bot
const bot = new TelegramBot(CONFIG.TELEGRAM_TOKEN, {
  polling: true,
  onlyFirstMatch: true
});

// Mapeo mejorado de campos
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
  supervisor: { synonyms: ['supervisor', 'encargado'] }, // ✅ Agregado
  serie: { synonyms: ['serie', 'serial'] },               // ✅ Agregado
  zsmart: { synonyms: ['zsmart', 'codigo z'] },          // ✅ Agregado
  estado: { synonyms: ['estado', 'situacion'] }          // ✅ Agregado
};

// Función para formatear RUT
function formatRut(rut) {
  if (!rut) return '';
  const cleanRut = rut.toString()
    .toUpperCase()
    .replace(/[^0-9K]/g, '')
    .replace(/^0+/, '');
  if (cleanRut.length < 2) return rut;
  return `${cleanRut.slice(0, -1)}-${cleanRut.slice(-1)}`;
}

// Procesador de mensajes
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  try {
    if (!msg.text || !msg.text.toLowerCase().includes('venta')) {
      return; // Ignorar mensajes sin "venta"
    }

    const ventaData = parseMessage(msg.text);
    validateData(ventaData);

    const response = await axios.post(CONFIG.GAS_URL, ventaData);
    await bot.sendMessage(chatId, response.data.message || '✅ Registro exitoso');

  } catch (error) {
    console.error('Error en mensaje:', error);
    const errorMsg = error.response?.data?.message ||
                    error.message ||
                    'Error al procesar la solicitud';
    await bot.sendMessage(chatId, `⚠️ ${errorMsg}`);
  }
});

// Analizador de mensajes mejorado
function parseMessage(text) {
  const result = {};
  const lines = text.split('\n');

  // Detección automática de empresa
  const lowerText = text.toLowerCase();
  if (lowerText.includes('entel')) result.empresa = 'ENTEL';
  else if (lowerText.includes('vtr')) result.empresa = 'VTR';
  else if (lowerText.includes('wom')) result.empresa = 'WOM';

  // Procesar líneas con formato "clave: valor"
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

// Validación de datos
function validateData(data) {
  // ✅ Validación eliminada: ahora se permite enviar datos aunque falten campos obligatorios
  return; // No se valida nada, se permite envío libre
}

console.log('🤖✅ Bot iniciado correctamente. Esperando mensajes...');

// ✅ Ruta para ping de UptimeRobot
app.get('/', (req, res) => {
  res.send('✅ Bot activo');
});

// ✅ Servidor Express para mantener activo el bot
app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Servidor web Express escuchando para keep-alive');
});

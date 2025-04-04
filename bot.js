const { Telegraf } = require('telegraf');
const axios = require('axios');

// Token de tu bot de Telegram
const bot = new Telegraf('7811444781:AAHDRHGOdqZcx_ffD4iaZE6aNp1m4qaq5_k');

// URL del Apps Script (ya desplegado como web app)
const URL_APP_SCRIPT = 'https://script.google.com/macros/s/AKfycbzstr7GiBjvrU4YQOX2yBOm5lKb95xmDegy3nTOH3fOz2veSr4g8LD_Eu93GChCD3c9/exec';

bot.start((ctx) => ctx.reply('Hola 👋 Soy tu bot. Puedes pegar tu formulario aquí.'));

bot.on('text', async (ctx) => {
  const mensaje = ctx.message.text;
// Extraer los datos desde el texto (MISMO FORMATO ORIGINAL)
const nombre = mensaje.match(/nombre\s*[:\-]\s*(.+)/i)?.[1] || '';
const rut = mensaje.match(/rut\s*[:\-]\s*(.+)/i)?.[1] || '';
const telefono = mensaje.match(/(fono|tel[eé]fono)\s*[:\-]\s*(.+)/i)?.[2]?.replace(/\D/g, '').replace(/^9?(\d{8})$/, '+569$1').replace(/^56(\d{9})$/, '+$1') || '';
const correo = mensaje.match(/correo\s*[:\-]\s*(.+)/i)?.[1] || '';
const direccion = mensaje.match(/dirección\s*[:\-]\s*(.+)/i)?.[1] || '';
const comuna = mensaje.match(/comuna\s*[:\-]\s*(.+)/i)?.[1] || '';
const region = mensaje.match(/región\s*[:\-]\s*(.+)/i)?.[1] || '';
const plan = mensaje.match(/plan\s*[:\-]\s*(.+)/i)?.[1] || '';
const deco = mensaje.match(/deco\s*[:\-]\s*(.+)/i)?.[1] || '';
const observaciones = mensaje.match(/observaciones\s*[:\-]\s*(.+)/i)?.[1] || '';
const empresa = mensaje.match(/empresa\s*[:\-]\s*(.+)/i)?.[1] || '';
const serie = mensaje.match(/serie\s*[:\-]\s*(.+)/i)?.[1] || '';
const ejecutivo = mensaje.match(/ejecutivo\s*[:\-]\s*(.+)/i)?.[1] || '';
const supervisor = mensaje.match(/supervisor\s*[:\-]\s*(.+)/i)?.[1] || 'Sebastián Leiva';
const zsmart = mensaje.match(/zsmart\s*[:\-]\s*(.+)/i)?.[1] || '';
const estado = mensaje.match(/estado\s*[:\-]\s*(.+)/i)?.[1] || '';

  const datos = {
    nombre, rut, telefono, correo, direccion, comuna, region,
    plan, deco, observaciones, empresa, serie, ejecutivo, supervisor, zsmart, estado
  };

  try {
    const response = await axios.post(URL_APP_SCRIPT, datos);
    if (response.data?.status === 'ok' || response.data === 'OK') {
      await ctx.reply('✅ Datos enviados correctamente a la hoja de cálculo.');
    } else {
      await ctx.reply('⚠️ El servidor respondió pero no fue exitoso.');
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    await ctx.reply('❌ Error al conectar con Google Sheets.');
  }
});
const http = require('http');
http.createServer((req, res) => {
  res.write('Bot activo');
  res.end();
}).listen(process.env.PORT || 3000);

bot.launch();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { messages, context } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(500).json({ error: 'API key no configurada en Vercel' }); return; }

  const systemPrompt = `Eres Mundialista 2026, un experto asistente del FIFA World Cup 2026 integrado en una app oficial del torneo. Respondes SIEMPRE en español, de forma concisa y directa.

FORMATO 2026:
- 48 equipos, 12 grupos (A-L) de 4 equipos cada uno
- Clasifican: 1° y 2° de cada grupo (24 equipos) + los 8 mejores terceros = 32 equipos
- Fases: Ronda de 32 → Octavos → Cuartos → Semis → Final
- Final: 19 julio 2026, MetLife Stadium, Nueva Jersey

GRUPOS CONFIRMADOS:
A: México, Corea del Sur, Sudáfrica, Chequia
B: Canadá, Suiza, Qatar, Bosnia-Herzegovina
C: Brasil, Marruecos, Escocia, Haití
D: USA, Australia, Paraguay, Turquía
E: Alemania, Ecuador, Costa de Marfil, Curazao
F: Países Bajos, Japón, Túnez, Suecia
G: Bélgica, Irán, Egipto, Nueva Zelanda
H: España, Uruguay, Arabia Saudita, Cabo Verde
I: Francia, Senegal, Noruega, Irak
J: Argentina, Austria, Argelia, Jordania
K: Portugal, Colombia, Uzbekistán, R.D.Congo
L: Inglaterra, Croacia, Panamá, Ghana

EMPAREJAMIENTOS RONDA DE 32 (oficiales FIFA):
M73: 2A vs 2B | M74: 1E vs 3(ABCDF) | M75: 1F vs 2C | M76: 1C vs 2F
M77: 1I vs 3(CDFGH) | M78: 2E vs 2I | M79: 1B vs 3(CEFHI) | M80: 1L vs 3(EHIJK)
M81: 1D vs 3(BEFIJ) | M82: 1G vs 3(AEHIJ) | M83: 2K vs 2L | M84: 1H vs 2J
M85: 1A vs 3(EFGIJ) | M86: 1J vs 2H | M87: 1K vs 3(DEIJL) | M88: 2D vs 2G

REGLAS DE CLASIFICACIÓN (orden de desempate FIFA):
1. Puntos (V=3, E=1, D=0)
2. Diferencia de goles
3. Goles a favor
4. Resultado del partido directo entre los empatados
5. Fair play (tarjetas)
6. Sorteo FIFA

MEJORES TERCEROS:
Se toman los 8 mejores de los 12 grupos terceros, ordenados por: puntos → DG → GF → fair play.
Su ubicación en la Ronda de 32 depende de qué grupos provengan (sistema FIFA Anexo C con 495 combinaciones posibles).

CONTEXTO ACTUAL DE LA APP (tabla en tiempo real):
${context || 'Sin datos de tabla disponibles en este momento.'}

Responde de forma útil, precisa y amigable. Si te preguntan sobre la tabla actual, usa el contexto proporcionado. Máximo 3 párrafos por respuesta salvo que se pida más detalle.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Error OpenAI');
    }

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

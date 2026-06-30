const FORMAT_INSTRUCTIONS = {
  thread:
    "Transforme ce contenu en thread Twitter/X de 5 à 7 tweets numérotés, percutant, avec un premier tweet accrocheur qui donne envie de lire la suite.",
  linkedin:
    "Transforme ce contenu en post LinkedIn professionnel, avec une accroche forte, un retour d'expérience ou un angle personnel, et des sauts de ligne aérés. 150-250 mots.",
  insta:
    "Transforme ce contenu en légende Instagram engageante, avec une première ligne qui arrête le scroll, un ton chaleureux, et 5 hashtags pertinents à la fin.",
  short:
    "Transforme ce contenu en script de vidéo courte (Reel/Short/TikTok) de 30 secondes : un hook dans les 3 premières secondes, puis le développement en phrases orales courtes, et une chute.",
  newsletter:
    "Transforme ce contenu en court bloc de newsletter (100-150 mots) avec un objet d'email accrocheur en première ligne, ton complice et direct.",
};

const FORMAT_NAMES = {
  thread: "Thread X",
  linkedin: "LinkedIn",
  insta: "Légende Insta",
  short: "Script Short",
  newsletter: "Newsletter",
};

export async function POST(req) {
  try {
    const { input, formats } = await req.json();

    if (!input || !formats || formats.length === 0) {
      return Response.json({ error: "Missing input or formats" }, { status: 400 });
    }

    const chosen = formats.filter((f) => FORMAT_INSTRUCTIONS[f]);

    const prompt = `Voici un contenu source :
"""
${input.trim()}
"""

Génère une transformation pour chacun des formats suivants. Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans backticks, sans texte avant ou après, de la forme :
{
${chosen.map((f) => `  "${f}": "le texte généré pour ${FORMAT_NAMES[f]}"`).join(",\n")}
}

Consignes par format :
${chosen.map((f) => `- ${f} (${FORMAT_NAMES[f]}): ${FORMAT_INSTRUCTIONS[f]}`).join("\n")}

Écris en français, dans un style naturel et engageant, fidèle au sens du contenu source.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: errText }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

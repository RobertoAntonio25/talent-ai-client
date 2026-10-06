import { Document, Page, Text, View } from "@react-pdf/renderer";
import { atsStyles as s } from "./atsTheme";
import type { AtsCvDoc } from "./atsDoc";
import { DOC_TITLES } from "./buildAtsDoc";

// El contenido fluye solo entre páginas (wrap nativo): nada se corta.
export default function CvPdfDocument({ doc }: { doc: AtsCvDoc }) {
  const t = DOC_TITLES[doc.lang];
  return (
    <Document title={`CV ATS - ${doc.displayName}`} author={doc.displayName}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{doc.displayName.toUpperCase()}</Text>
          {doc.headline ? <Text style={s.headline}>{doc.headline}</Text> : null}
          {doc.contactLine ? (
            <Text style={s.contact}>{doc.contactLine}</Text>
          ) : null}
        </View>

        {doc.summary ? (
          <View style={s.section}>
            <Text style={s.h2}>{t.summary}</Text>
            <Text style={s.summary}>{doc.summary}</Text>
          </View>
        ) : null}

        {doc.skills.length > 0 ? (
          <View style={s.section}>
            <Text style={s.h2}>{t.skills}</Text>
            {doc.skills.map((g) => (
              <Text key={g.label} style={s.skillLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  {g.label}:{" "}
                </Text>
                {g.items.join(", ")}
              </Text>
            ))}
          </View>
        ) : null}

        {doc.experience.length > 0 ? (
          <View style={s.section}>
            <Text style={s.h2}>{t.experience}</Text>
            {doc.experience.map((exp, i) => (
              <View key={`${exp.company}-${i}`} style={{ marginBottom: 6 }}>
                <View style={s.expHead}>
                  <Text style={s.company}>{exp.company}</Text>
                  <Text>{exp.dates}</Text>
                </View>
                {exp.roleLine ? (
                  <Text style={s.roleLine}>{exp.roleLine}</Text>
                ) : null}
                {exp.bullets.map((b, bi) => (
                  <View key={bi} style={s.bulletRow}>
                    <Text style={s.bulletMark}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {doc.projects.length > 0 ? (
          <View style={s.section}>
            <Text style={s.h2}>{t.projects}</Text>
            {doc.projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <View style={s.itemHead}>
                  <Text style={s.itemTitle}>{p.name}</Text>
                  {p.repoUrl ? <Text>{p.repoUrl}</Text> : null}
                </View>
                {p.description ? (
                  <Text style={s.itemSub}>{p.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {doc.education.length > 0 ? (
          <View style={s.section}>
            <Text style={s.h2}>{t.education}</Text>
            {doc.education.map((e, i) => (
              <Text key={i} style={s.eduLine}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{e.degree}</Text>
                {e.institution ? ` — ${e.institution}` : ""}
                {e.period ? ` · ${e.period}` : ""}
                {e.details ? ` (${e.details})` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        {doc.languagesLine ? (
          <View style={s.section}>
            <Text style={s.h2}>{t.languages}</Text>
            <Text style={s.skillLine}>{doc.languagesLine}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

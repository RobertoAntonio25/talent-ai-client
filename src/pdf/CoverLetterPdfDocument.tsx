import { Document, Page, Text, View } from "@react-pdf/renderer";
import { atsStyles as s } from "./atsTheme";
import type { AtsLetterDoc } from "./buildAtsDoc";
import { DOC_TITLES } from "./buildAtsDoc";

// Carta A4 con texto real: párrafos justificados que fluyen entre páginas.
export default function CoverLetterPdfDocument({ doc }: { doc: AtsLetterDoc }) {
  const t = DOC_TITLES[doc.lang];
  return (
    <Document title={`Carta - ${doc.identityName}`} author={doc.identityName}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{doc.identityName}</Text>
          {doc.roleLine ? <Text style={s.headline}>{doc.roleLine}</Text> : null}
          {doc.identityLine ? (
            <Text style={s.contact}>{doc.identityLine}</Text>
          ) : null}
        </View>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 9, color: "#4b5563" }}>{doc.date}</Text>
          <Text
            style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 4 }}
          >
            {t.team} • {doc.company}
          </Text>
          <Text style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>
            {t.subject}: {doc.subject}
          </Text>
        </View>

        {doc.paragraphs.map((p, i) => (
          <Text
            key={i}
            style={{
              fontSize: 9,
              lineHeight: 1.55,
              textAlign: "justify",
              marginBottom: 6,
            }}
          >
            {p}
          </Text>
        ))}

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 9, color: "#4b5563" }}>{t.closing}</Text>
          <Text
            style={{ fontFamily: "Helvetica-Bold", fontSize: 10, marginTop: 2 }}
          >
            {doc.identityName}
          </Text>
          {doc.roleLine ? (
            <Text style={{ fontSize: 8, color: "#4b5563" }}>
              {doc.roleLine}
            </Text>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

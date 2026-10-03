import { Font, StyleSheet } from "@react-pdf/renderer";

// Sin guionado: las palabras pasan enteras a la línea siguiente. Partirlas
// (perfec-tamente) rompe el matcheo de keywords en los parsers ATS.
Font.registerHyphenationCallback((word) => [word]);

// Paleta sobria estilo Dani García: 1 columna, negro sobre blanco.
export const atsStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.45,
    color: "#000000",
  },
  header: { textAlign: "center", marginBottom: 8 },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    lineHeight: 1.2,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headline: { fontFamily: "Helvetica-Bold", fontSize: 9, marginTop: 0 },
  contact: { fontSize: 8, color: "#4b5563", marginTop: 4 },
  summary: { fontSize: 9, lineHeight: 1.5 },
  section: { marginTop: 10 },
  h2: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 2,
    marginBottom: 5,
  },
  skillLine: { fontSize: 9, marginBottom: 1 },
  expHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
  company: { fontFamily: "Helvetica-Bold" },
  roleLine: { fontFamily: "Helvetica-Oblique", fontSize: 9, marginBottom: 3 },
  bulletRow: { flexDirection: "row", marginBottom: 2, paddingLeft: 8 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1, fontSize: 9, lineHeight: 1.45 },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
  itemTitle: { fontFamily: "Helvetica-Bold" },
  itemSub: { fontSize: 9, marginTop: 1 },
  itemDetail: { fontSize: 8, color: "#000000", marginTop: 1 },
});

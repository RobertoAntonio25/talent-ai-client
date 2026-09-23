import KanbanBoard from "../components/KanBoard";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-4">Tu Panel de Empleo</h2>
      <p className="text-slate-400">
        <KanbanBoard />
      </p>
    </div>
  );
}

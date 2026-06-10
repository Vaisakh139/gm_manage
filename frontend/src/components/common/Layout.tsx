import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface Props { title: string }

export default function Layout({ title }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

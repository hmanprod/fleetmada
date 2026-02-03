import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentification - FleetMada',
  description: 'Connectez-vous à votre compte FleetMada ou créez un nouveau compte',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple pour les pages d'auth */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg relative w-32 h-8">
                <Image
                  src="/img/logo-dark.png"
                  alt="FleetMada Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu des pages d'authentification */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
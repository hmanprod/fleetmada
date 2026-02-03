import Image from 'next/image';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0c2e26]">
            <div className="relative w-64 h-32">
                <Image
                    src="/img/logo.png"
                    alt="FleetMada Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>
    );
}

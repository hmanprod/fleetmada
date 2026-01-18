"use client";

import React from 'react';
import type { Vehicle } from '@/lib/services/vehicles-api';

interface DetailRowProps {
    label: string;
    value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <dt className="text-sm text-gray-600">{label}</dt>
            <dd className="text-sm text-gray-900 font-medium">{value || '—'}</dd>
        </div>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
}

function Section({ title, children, onEdit }: SectionProps) {
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-[#008751] text-sm font-medium hover:underline"
                    >
                        Edit
                    </button>
                )}
            </div>
            <dl className="space-y-0">
                {children}
            </dl>
        </div>
    );
}

interface VehicleSpecsProps {
    vehicle: Vehicle;
}

export function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
    const formatNumber = (value: number | null | undefined, suffix = '') => {
        if (value === null || value === undefined) return null;
        return `${value.toLocaleString()}${suffix}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Spécifications</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                    <Section title="Identification">
                        <DetailRow label="VIN" value={vehicle.vin} />
                        <DetailRow label="Plaque d'immatriculation" value={vehicle.licensePlate} />
                        <DetailRow label="Compteur actuel" value={formatNumber(vehicle.meterReading, ` ${vehicle.primaryMeter || 'mi'}`)} />
                    </Section>

                    <Section title="Dimensions">
                        <DetailRow label="Largeur" value={formatNumber(vehicle.width, ' mm')} />
                        <DetailRow label="Hauteur" value={formatNumber(vehicle.height, ' mm')} />
                        <DetailRow label="Longueur" value={formatNumber(vehicle.length, ' mm')} />
                        <DetailRow label="Volume intérieur" value={formatNumber(vehicle.interiorVolume, ' L')} />
                        <DetailRow label="Nombre de passagers" value={vehicle.passengerCount} />
                        <DetailRow label="Volume de chargement" value={formatNumber(vehicle.cargoVolume, ' L')} />
                        <DetailRow label="Garde au sol" value={formatNumber(vehicle.groundClearance, ' mm')} />
                        <DetailRow label="Longueur de la caisse" value={formatNumber(vehicle.bedLength, ' mm')} />
                    </Section>

                    <Section title="Poids">
                        <DetailRow label="Poids à vide" value={formatNumber(vehicle.curbWeight, ' kg')} />
                        <DetailRow label="Poids nominal brut" value={formatNumber(vehicle.grossVehicleWeight, ' kg')} />
                    </Section>

                    <Section title="Performance">
                        <DetailRow label="Capacité de remorquage" value={formatNumber(vehicle.towingCapacity, ' kg')} />
                        <DetailRow label="Charge utile maximale" value={formatNumber(vehicle.maxPayload, ' kg')} />
                    </Section>

                    <Section title="Consommation">
                        <DetailRow label="Ville EPA" value={formatNumber(vehicle.epaCity, ' L/100km')} />
                        <DetailRow label="Autoroute EPA" value={formatNumber(vehicle.epaHighway, ' L/100km')} />
                        <DetailRow label="Combiné EPA" value={formatNumber(vehicle.epaCombined, ' L/100km')} />
                    </Section>

                    <Section title="Carburant">
                        <DetailRow label="Qualité du carburant" value={vehicle.fuelQuality} />
                        <DetailRow label="Capacité du réservoir" value={formatNumber(vehicle.fuelTankCapacity, ' L')} />
                        <DetailRow label="Capacité du réservoir 2" value={formatNumber(vehicle.fuelTank2Capacity, ' L')} />
                    </Section>

                    <Section title="Huile">
                        <DetailRow label="Capacité d'huile" value={formatNumber(vehicle.oilCapacity, ' L')} />
                    </Section>
                </div>

                {/* Right Column */}
                <div>
                    <Section title="Moteur">
                        <DetailRow label="Description du moteur" value={vehicle.engineDescription} />
                        <DetailRow label="Marque du moteur" value={vehicle.engineBrand} />
                        <DetailRow label="Aspiration du moteur" value={vehicle.engineAspiration} />
                        <DetailRow label="Type de bloc moteur" value={vehicle.engineBlockType} />
                        <DetailRow label="Alésage du moteur" value={formatNumber(vehicle.engineBore, ' mm')} />
                        <DetailRow label="Type de came du moteur" value={vehicle.engineCamType} />
                        <DetailRow label="Compression du moteur" value={vehicle.engineCompression} />
                        <DetailRow label="Cylindres moteur" value={vehicle.engineCylinders} />
                        <DetailRow label="Cylindrée du moteur" value={formatNumber(vehicle.engineDisplacement, ' L')} />
                        <DetailRow label="Induction de carburant" value={vehicle.fuelInduction} />
                        <DetailRow label="Puissance max" value={formatNumber(vehicle.maxHp, ' hp')} />
                        <DetailRow label="Couple max" value={formatNumber(vehicle.maxTorque, ' Nm')} />
                        <DetailRow label="Régime max" value={formatNumber(vehicle.redlineRpm, ' RPM')} />
                        <DetailRow label="Course du moteur" value={formatNumber(vehicle.engineStroke, ' mm')} />
                        <DetailRow label="Soupapes moteur" value={vehicle.engineValves} />
                    </Section>

                    <Section title="Transmission">
                        <DetailRow label="Description de la transmission" value={vehicle.transmissionDescription} />
                        <DetailRow label="Marque de la transmission" value={vehicle.transmissionBrand} />
                        <DetailRow label="Type de transmission" value={vehicle.transmissionType} />
                        <DetailRow label="Nombre de rapports" value={vehicle.transmissionGears} />
                    </Section>

                    <Section title="Roues et Pneus">
                        <DetailRow label="Type de propulsion" value={vehicle.driveType} />
                        <DetailRow label="Système de freinage" value={vehicle.brakeSystem} />
                        <DetailRow label="Voie avant" value={formatNumber(vehicle.frontTrackWidth, ' mm')} />
                        <DetailRow label="Voie arrière" value={formatNumber(vehicle.rearTrackWidth, ' mm')} />
                        <DetailRow label="Empattement" value={formatNumber(vehicle.wheelbase, ' mm')} />
                        <DetailRow label="Diamètre roue avant" value={formatNumber(vehicle.frontWheelDiameter, '"')} />
                        <DetailRow label="Diamètre roue arrière" value={formatNumber(vehicle.rearWheelDiameter, '"')} />
                        <DetailRow label="Type d'essieu arrière" value={vehicle.rearAxleType} />
                        <DetailRow label="Type de pneu avant" value={vehicle.frontTireType} />
                        <DetailRow label="Pression pneu avant" value={formatNumber(vehicle.frontTirePsi, ' PSI')} />
                        <DetailRow label="Type de pneu arrière" value={vehicle.rearTireType} />
                        <DetailRow label="Pression pneu arrière" value={formatNumber(vehicle.rearTirePsi, ' PSI')} />
                    </Section>
                </div>
            </div>
        </div>
    );
}
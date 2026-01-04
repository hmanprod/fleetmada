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
                <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
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
                        <DetailRow label="Width" value={formatNumber(vehicle.width, ' mm')} />
                        <DetailRow label="Height" value={formatNumber(vehicle.height, ' mm')} />
                        <DetailRow label="Length" value={formatNumber(vehicle.length, ' mm')} />
                        <DetailRow label="Interior Volume" value={formatNumber(vehicle.interiorVolume, ' L')} />
                        <DetailRow label="Nombre de passagers" value={vehicle.passengerCount} />
                        <DetailRow label="Cargo Volume" value={formatNumber(vehicle.cargoVolume, ' L')} />
                        <DetailRow label="Ground Clearance" value={formatNumber(vehicle.groundClearance, ' mm')} />
                        <DetailRow label="Bed Length" value={formatNumber(vehicle.bedLength, ' mm')} />
                    </Section>

                    <Section title="Weight">
                        <DetailRow label="Curb Weight" value={formatNumber(vehicle.curbWeight, ' kg')} />
                        <DetailRow label="Gross Vehicle Weight Rating" value={formatNumber(vehicle.grossVehicleWeight, ' kg')} />
                    </Section>

                    <Section title="Performance">
                        <DetailRow label="Base Towing Capacity" value={formatNumber(vehicle.towingCapacity, ' kg')} />
                        <DetailRow label="Max Payload" value={formatNumber(vehicle.maxPayload, ' kg')} />
                    </Section>

                    <Section title="Fuel Economy">
                        <DetailRow label="EPA City" value={formatNumber(vehicle.epaCity, ' L/100km')} />
                        <DetailRow label="EPA Highway" value={formatNumber(vehicle.epaHighway, ' L/100km')} />
                        <DetailRow label="EPA Combined" value={formatNumber(vehicle.epaCombined, ' L/100km')} />
                    </Section>

                    <Section title="Fuel">
                        <DetailRow label="Fuel Quality" value={vehicle.fuelQuality} />
                        <DetailRow label="Fuel Tank Capacity" value={formatNumber(vehicle.fuelTankCapacity, ' L')} />
                        <DetailRow label="Fuel Tank 2 Capacity" value={formatNumber(vehicle.fuelTank2Capacity, ' L')} />
                    </Section>

                    <Section title="Oil">
                        <DetailRow label="Oil Capacity" value={formatNumber(vehicle.oilCapacity, ' L')} />
                    </Section>
                </div>

                {/* Right Column */}
                <div>
                    <Section title="Engine">
                        <DetailRow label="Engine Description" value={vehicle.engineDescription} />
                        <DetailRow label="Engine Brand" value={vehicle.engineBrand} />
                        <DetailRow label="Engine Aspiration" value={vehicle.engineAspiration} />
                        <DetailRow label="Engine Block Type" value={vehicle.engineBlockType} />
                        <DetailRow label="Engine Bore" value={formatNumber(vehicle.engineBore, ' mm')} />
                        <DetailRow label="Engine Cam Type" value={vehicle.engineCamType} />
                        <DetailRow label="Engine Compression" value={vehicle.engineCompression} />
                        <DetailRow label="Engine Cylinders" value={vehicle.engineCylinders} />
                        <DetailRow label="Engine Displacement" value={formatNumber(vehicle.engineDisplacement, ' L')} />
                        <DetailRow label="Fuel Induction" value={vehicle.fuelInduction} />
                        <DetailRow label="Max HP" value={formatNumber(vehicle.maxHp, ' hp')} />
                        <DetailRow label="Max Torque" value={formatNumber(vehicle.maxTorque, ' Nm')} />
                        <DetailRow label="Redline RPM" value={formatNumber(vehicle.redlineRpm, ' RPM')} />
                        <DetailRow label="Engine Stroke" value={formatNumber(vehicle.engineStroke, ' mm')} />
                        <DetailRow label="Engine Valves" value={vehicle.engineValves} />
                    </Section>

                    <Section title="Transmission">
                        <DetailRow label="Transmission Description" value={vehicle.transmissionDescription} />
                        <DetailRow label="Transmission Brand" value={vehicle.transmissionBrand} />
                        <DetailRow label="Transmission Type" value={vehicle.transmissionType} />
                        <DetailRow label="Transmission Gears" value={vehicle.transmissionGears} />
                    </Section>

                    <Section title="Wheels & Tires">
                        <DetailRow label="Drive Type" value={vehicle.driveType} />
                        <DetailRow label="Brake System" value={vehicle.brakeSystem} />
                        <DetailRow label="Front Track Width" value={formatNumber(vehicle.frontTrackWidth, ' mm')} />
                        <DetailRow label="Rear Track Width" value={formatNumber(vehicle.rearTrackWidth, ' mm')} />
                        <DetailRow label="Wheelbase" value={formatNumber(vehicle.wheelbase, ' mm')} />
                        <DetailRow label="Front Wheel Diameter" value={formatNumber(vehicle.frontWheelDiameter, '"')} />
                        <DetailRow label="Rear Wheel Diameter" value={formatNumber(vehicle.rearWheelDiameter, '"')} />
                        <DetailRow label="Rear Axle Type" value={vehicle.rearAxleType} />
                        <DetailRow label="Front Tire Type" value={vehicle.frontTireType} />
                        <DetailRow label="Front Tire PSI" value={formatNumber(vehicle.frontTirePsi, ' PSI')} />
                        <DetailRow label="Rear Tire Type" value={vehicle.rearTireType} />
                        <DetailRow label="Rear Tire PSI" value={formatNumber(vehicle.rearTirePsi, ' PSI')} />
                    </Section>
                </div>
            </div>
        </div>
    );
}
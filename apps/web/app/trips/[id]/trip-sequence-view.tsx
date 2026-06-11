"use client";

import type { MembershipRole, StopPublic } from "@traveltogether/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CoverGraphic, Icon } from "@/components/atlas";
import { DateField } from "@/components/date-field";
import { dateOnly, formatWeekdayDayMonth, nightsBetween } from "@/lib/format/date";
import { displayCode } from "@/lib/trips/journey";
import {
  createStopAction,
  deleteStopAction,
  reorderStopsAction,
  updateStopAction,
} from "./actions";

interface Props {
  tripId: string;
  initialStops: StopPublic[];
  role: MembershipRole;
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export default function TripSequenceView({ tripId, initialStops, role }: Props) {
  const router = useRouter();
  const [stops, setStops] = useState<StopPublic[]>(initialStops);
  const [adding, setAdding] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newAirportCode, setNewAirportCode] = useState("");
  const [newArrivalDate, setNewArrivalDate] = useState("");
  const [newDepartureDate, setNewDepartureDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCity, setEditCity] = useState("");
  const [editAirportCode, setEditAirportCode] = useState("");
  const [editArrivalDate, setEditArrivalDate] = useState("");
  const [editDepartureDate, setEditDepartureDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const isOrganizer = role === "organizer";

  function nullableDate(value: string): string | null {
    return value.trim() ? value : null;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newCity.trim()) return;
    setLoading(true);
    const stop = await createStopAction(tripId, {
      city: newCity.trim(),
      airport_code: newAirportCode.trim().toUpperCase() || null,
      arrival_date: nullableDate(newArrivalDate),
      departure_date: nullableDate(newDepartureDate),
    });
    if (stop) {
      setStops((prev) => [...prev, stop]);
      setNewCity("");
      setNewAirportCode("");
      setNewArrivalDate("");
      setNewDepartureDate("");
      setAdding(false);
    }
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(stopId: string) {
    setLoading(true);
    await deleteStopAction(tripId, stopId);
    setStops((prev) => prev.filter((s) => s.id !== stopId));
    setLoading(false);
    router.refresh();
  }

  function handleEdit(stop: StopPublic) {
    setEditingId(stop.id);
    setEditCity(stop.city);
    setEditAirportCode(stop.airport_code ?? "");
    setEditArrivalDate(dateOnly(stop.arrival_date) ?? "");
    setEditDepartureDate(dateOnly(stop.departure_date) ?? "");
  }

  async function handleSaveEdit(stopId: string) {
    if (!editCity.trim()) return;
    setLoading(true);
    const updated = await updateStopAction(tripId, stopId, {
      city: editCity.trim(),
      airport_code: editAirportCode.trim().toUpperCase() || null,
      arrival_date: nullableDate(editArrivalDate),
      departure_date: nullableDate(editDepartureDate),
    });
    if (updated) setStops((prev) => prev.map((s) => (s.id === stopId ? updated : s)));
    setEditingId(null);
    setLoading(false);
    router.refresh();
  }

  // ── drag-and-drop (arrastar cards para reordenar) ──
  function handleDragStart(index: number) {
    setDragIndex(index);
  }
  function handleDragEnter(overIndex: number) {
    if (dragIndex === null || dragIndex === overIndex) return;
    setStops((prev) => reorder(prev, dragIndex, overIndex));
    setDragIndex(overIndex);
  }
  async function handleDrop() {
    const from = dragIndex;
    setDragIndex(null);
    if (from === null) return;
    setLoading(true);
    await reorderStopsAction(
      tripId,
      stops.map((s) => s.id),
    );
    setLoading(false);
    router.refresh();
  }

  const editForm = (stopId: string) => (
    <div className="card flat" style={{ border: "1.5px dashed var(--line)", padding: "16px 18px" }}>
      <div className="form-row cols-2">
        <label className="field">
          <span>Cidade</span>
          <input
            onChange={(e) => setEditCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(stopId)}
            value={editCity}
          />
        </label>
        <label className="field">
          <span>Aeroporto</span>
          <input
            maxLength={3}
            onChange={(e) => setEditAirportCode(e.target.value)}
            placeholder="LIS"
            style={{ textTransform: "uppercase", fontFamily: "var(--font-mono)" }}
            value={editAirportCode}
          />
        </label>
      </div>
      <div className="form-row cols-2" style={{ marginTop: 12 }}>
        <div className="field">
          <span>Chegada</span>
          <DateField ariaLabel="Chegada" onChange={setEditArrivalDate} value={editArrivalDate} />
        </div>
        <div className="field">
          <span>Saída</span>
          <DateField
            ariaLabel="Saída"
            min={editArrivalDate || undefined}
            onChange={setEditDepartureDate}
            value={editDepartureDate}
          />
        </div>
      </div>
      <div className="form-actions" style={{ marginTop: 14 }}>
        <button className="btn small ghost" onClick={() => setEditingId(null)} type="button">
          Cancelar
        </button>
        <button
          className="btn small accent"
          disabled={loading}
          onClick={() => handleSaveEdit(stopId)}
          type="button"
        >
          Salvar
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="section-head">
        <span className="kicker">paradas</span>
        <h2>
          {stops.length ? `${stops.length} cidade${stops.length > 1 ? "s" : ""}` : "Nenhuma ainda"}
        </h2>
        <span className="spacer" />
        {isOrganizer && (
          <button className="btn small ghost" onClick={() => setAdding((v) => !v)} type="button">
            <Icon name="plus" size={13} /> Adicionar parada
          </button>
        )}
      </div>

      {adding && isOrganizer && (
        <form
          className="card flat"
          onSubmit={handleAdd}
          style={{ border: "1.5px dashed var(--line)", padding: "18px 20px", marginBottom: 18 }}
        >
          <div className="form-row cols-4">
            <label className="field">
              <span>Cidade</span>
              <input
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Lisboa"
                required
                value={newCity}
              />
            </label>
            <label className="field">
              <span>Aeroporto</span>
              <input
                maxLength={3}
                onChange={(e) => setNewAirportCode(e.target.value)}
                placeholder="LIS"
                style={{ textTransform: "uppercase", fontFamily: "var(--font-mono)" }}
                value={newAirportCode}
              />
            </label>
            <div className="field">
              <span>Chegada</span>
              <DateField ariaLabel="Chegada" onChange={setNewArrivalDate} value={newArrivalDate} />
            </div>
            <div className="field">
              <span>Saída</span>
              <DateField
                ariaLabel="Saída"
                min={newArrivalDate || undefined}
                onChange={setNewDepartureDate}
                value={newDepartureDate}
              />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 14 }}>
            <button className="btn small ghost" onClick={() => setAdding(false)} type="button">
              Cancelar
            </button>
            <button
              className="btn small accent"
              disabled={loading || !newCity.trim()}
              type="submit"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {stops.length === 0 ? (
        <div className="empty">
          <Icon name="pin" size={22} />
          <div style={{ fontWeight: 600, color: "var(--ink-soft)" }}>
            Essa viagem ainda não tem paradas.
          </div>
          <div style={{ fontSize: 13.5, maxWidth: 380 }}>
            {isOrganizer
              ? "Adicione a primeira cidade para o itinerário (e os trajetos) ganharem forma."
              : "Os organizadores ainda não definiram as cidades."}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          {stops.map((stop, idx) => {
            const nights = nightsBetween(stop.arrival_date, stop.departure_date);
            const code = stop.airport_code ?? displayCode(stop.city);
            if (editingId === stop.id) return <div key={stop.id}>{editForm(stop.id)}</div>;
            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: reordenação por arrastar; melhoria progressiva não-crítica no beta
              <div
                key={stop.id}
                className="card stop-card"
                draggable={isOrganizer && !loading}
                onDragEnd={handleDrop}
                onDragEnter={() => handleDragEnter(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDragStart={() => handleDragStart(idx)}
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  opacity: dragIndex === idx ? 0.5 : 1,
                }}
              >
                <CoverGraphic seedText={stop.id} codeLabel={code} height={84} />
                <div
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {isOrganizer && (
                      <span className="drag-grip" title="Arraste para reordenar">
                        <Icon name="grip" size={14} />
                      </span>
                    )}
                    <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                      parada {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="spacer" style={{ flex: 1 }} />
                    {nights && (
                      <span className="chip outline">
                        {nights} noite{nights !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <h3 className="display" style={{ fontSize: 21 }}>
                    {stop.city}
                  </h3>
                  <div className="mono-num" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {formatWeekdayDayMonth(stop.arrival_date) ?? "data a definir"}
                    {stop.departure_date ? ` → ${formatWeekdayDayMonth(stop.departure_date)}` : ""}
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Link
                      className="btn small ghost"
                      href={`/trips/${tripId}/stops/${stop.id}/itinerary`}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Icon name="compass" size={13} /> Roteiro
                    </Link>
                    {isOrganizer && (
                      <>
                        <button
                          className="icon-btn"
                          onClick={() => handleEdit(stop)}
                          title="Editar parada"
                          type="button"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          disabled={loading}
                          onClick={() => handleDelete(stop.id)}
                          title="Remover parada"
                          type="button"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

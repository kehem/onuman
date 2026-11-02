<template>
  <section class="structural-results" aria-labelledby="structural-output-title">
    <header class="results-header">
      <div>
        <p class="eyebrow">PROJECT RESULTS / {{ itemLabel.toUpperCase() }}</p>
        <h1 id="structural-output-title">{{ itemLabel }} output</h1>
        <p class="intro">Overview and connected details for the current selection.</p>
      </div>
      <span class="view-label">Detailed view</span>
    </header>

    <section class="overview" aria-labelledby="items-overview-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">CURRENT SELECTION</p>
          <h2 id="items-overview-title">{{ itemLabel }} overview</h2>
        </div>
      </div>
      <div class="volume-summary">
        <div class="metric">
          <span>Total volume</span>
          <strong>{{ formatNumber(unitStore.convertUnit('mm', totalVolume, 3)) }} <small>{{ unitStore.targetUnit }}<sup>3</sup></small></strong>
        </div>
        <div class="metric">
          <span>Total dry volume</span>
          <strong>{{ formatNumber(unitStore.convertUnit('mm', totalVolume * 1.54, 3)) }} <small>{{ unitStore.targetUnit }}<sup>3</sup></small></strong>
        </div>
      </div>
      <div v-if="columns.length" class="formatted-table overview-table">
        <table class="onuman-table column-table">
          <thead>
            <tr>
              <th scope="col">Name</th><th v-if="hasShape" scope="col">Shape</th><th scope="col">Quantity</th><th scope="col">Height</th><th v-if="kind === 'wall'" scope="col">Clear cover</th>
              <th v-if="hasDimensions" scope="col">Width</th><th v-if="hasDimensions" scope="col">Length</th>
              <th v-if="hasShape" scope="col">Diameter</th><th scope="col">Area</th><th scope="col">Volume</th><th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="column in columns" :key="column.id">
              <td><Comments :typeid="column.id" :type="type" />{{ column.name }} <span class="column-id">#{{ column.id }}</span></td>
              <td v-if="hasShape">{{ column.type }}</td>
              <td>{{ formatNumber(column.quantity) }}</td>
              <td>{{ formatNumber(unitStore.convertUnit('mm', column.height)) }} {{ unitStore.targetUnit }}</td>
              <td v-if="kind === 'wall'">{{ linearValue(column.clear_cover) }}</td>
              <td v-if="hasDimensions">{{ kind === 'wall' ? linearValue(column.width) : dimension(column.width) }}</td>
              <td v-if="hasDimensions">{{ kind === 'wall' ? linearValue(column.length) : dimension(column.length) }}</td>
              <td v-if="hasShape">{{ dimension(column.diameter) }}</td>
              <td>{{ formatNumber(unitStore.convertUnit('mm', column.area, 2)) }} {{ unitStore.targetUnit }}<sup>2</sup></td>
              <td>{{ formatNumber(unitStore.convertUnit('mm', column.volume, 3)) }} {{ unitStore.targetUnit }}<sup>3</sup></td>
              <td class="action"><Actions :type="type" :sectionDATA="column" @send-data="emit('edit', $event)" @delete-data="emit('delete', $event)" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-state">No {{ itemLabel.toLowerCase() }}s in this selection yet.</p>
    </section>

    <section class="connected-results" aria-labelledby="item-details-title">
      <div class="section-heading details-heading">
        <div>
          <p class="eyebrow">CONNECTED RESULTS</p>
          <h2 id="item-details-title">Details by {{ itemLabel.toLowerCase() }}</h2>
          <p class="section-description">Each {{ itemLabel.toLowerCase() }} is shown with its own reinforcements and stirrups.</p>
        </div>
      </div>

      <article v-for="column in columns" :key="column.id" class="column-card" :aria-labelledby="`column-result-${column.id}`">
        <header class="card-header">
          <div class="card-heading">
            <span class="card-marker" aria-hidden="true"></span>
            <div>
              <p class="eyebrow">{{ itemLabel.toUpperCase() }} / #{{ column.id }}</p>
              <h3 :id="`column-result-${column.id}`">{{ column.name }}</h3>
            </div>
          </div>
          <span v-if="hasShape" class="shape-label">{{ column.type }}</span>
        </header>

        <div class="column-properties">
          <div><span>Quantity</span><strong>{{ formatNumber(column.quantity) }}</strong></div>
          <div><span>Height</span><strong>{{ formatNumber(unitStore.convertUnit('mm', column.height)) }} {{ unitStore.targetUnit }}</strong></div>
          <div v-if="kind === 'wall'"><span>Clear cover</span><strong>{{ linearValue(column.clear_cover) }}</strong></div>
          <div v-if="!hasShape || column.type === 'Rectangle'"><span>Width</span><strong>{{ kind === 'wall' ? linearValue(column.width) : dimension(column.width) }}</strong></div>
          <div v-if="!hasShape || column.type === 'Rectangle'"><span>Length</span><strong>{{ kind === 'wall' ? linearValue(column.length) : dimension(column.length) }}</strong></div>
          <div v-if="hasShape"><span>Diameter</span><strong>{{ dimension(column.diameter) }}</strong></div>
          <div><span>Area</span><strong>{{ formatNumber(unitStore.convertUnit('mm', column.area, 2)) }} {{ unitStore.targetUnit }}<sup>2</sup></strong></div>
          <div><span>Volume</span><strong>{{ formatNumber(unitStore.convertUnit('mm', column.volume, 3)) }} {{ unitStore.targetUnit }}<sup>3</sup></strong></div>
        </div>

        <div class="detail-grid">
          <section class="detail-section" :aria-labelledby="`column-reinforcement-${column.id}`">
            <div class="detail-heading"><span class="detail-index">01</span><h4 :id="`column-reinforcement-${column.id}`">Long reinforcements</h4></div>
            <div v-if="column.reinforcements?.length" class="detail-table-scroll">
              <table class="detail-table">
                <thead v-if="kind === 'footing'"><tr><th scope="col">Diameter</th><th scope="col">Horizontal total rods</th><th scope="col">Horizontal weight</th><th scope="col">Vertical total rods</th><th scope="col">Vertical weight</th><th scope="col">Support</th></tr></thead>
                <thead v-else><tr><th scope="col">Diameter</th><th scope="col">Quantity</th><th scope="col">Weight (KG)</th><th scope="col">Support</th></tr></thead>
                <tbody><tr v-for="(item, index) in column.reinforcements" :key="index">
                  <template v-if="kind === 'footing'">
                    <td>{{ item.horizontal_diameter }} mm</td><td>{{ item.horizontal_bar ?? 0 }} pcs</td><td>{{ formatNumber(item.horizontal_weight ?? 0) }}</td><td>{{ formatNumber(item.vertical_bar ?? 0) }} pcs</td><td>{{ formatNumber(item.vertical_weight ?? 0) }}</td><td>{{ item.support ? 'Yes' : '—' }}</td>
                  </template>
                  <template v-else>
                    <td>{{ item.rod_diameter }} mm</td><td>{{ formatNumber(item.rod_qty) }}</td><td>{{ formatNumber(item.weight ?? 0) }}</td><td>{{ item.support ? 'Yes' : '—' }}</td>
                  </template>
                </tr></tbody>
              </table>
            </div>
            <p v-else class="empty-detail">No reinforcement data available.</p>
          </section>

          <section class="detail-section" :aria-labelledby="`column-stirrups-${column.id}`">
            <div class="detail-heading"><span class="detail-index">02</span><h4 :id="`column-stirrups-${column.id}`">Stirrups</h4></div>
            <div v-if="column.stirrups?.length" class="detail-table-scroll">
              <table class="detail-table">
                <thead><tr><th scope="col">Diameter</th><th scope="col">Deduction</th><th scope="col">Weight</th><th scope="col">Total ring</th><th scope="col">Height</th></tr></thead>
                <tbody><tr v-for="(item, index) in column.stirrups" :key="index">
                  <td>{{ Number(item.diameter) || 0 }} mm</td>
                  <td>{{ formatNumber(unitStore.convertUnit('mm', Number(item.deduction) || 0)) }} {{ unitStore.targetUnit }}</td>
                  <td>{{ formatNumber(Number(item.weight) || 0) }} Kg/ft</td>
                  <td>{{ formatNumber(Number(item.total_ring) || 0) }} pcs</td>
                  <td>{{ Number(item.height) ? `${formatNumber(Number(item.height))} ${unitStore.targetUnit}` : '—' }}</td>
                </tr></tbody>
              </table>
            </div>
            <p v-else class="empty-detail">No stirrup data available.</p>
          </section>
        </div>
      </article>

      <div class="weight-summary" aria-label="Overall weights for the current selection">
        <div><span>Total reinforcement weight</span><strong>{{ formatNumber(totalReinforcementWeight) }}</strong></div>
        <div><span>Total stirrup weight</span><strong>{{ formatNumber(totalStirrupWeight) }} <small>Kg</small></strong></div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InputItems } from '../../Interfaces/Inputs'
import { formatNumber } from '../../composables/DecimalNumberValidator'
import { useUnitStore } from '../../stores/unitStore'
import Comments from '../Dashboard/Comments.vue'
import Actions from './Actions.vue'

interface ResultReinforcement {
  rod_qty?: number; rod_diameter?: number; support?: boolean; weight?: number
  horizontal_diameter?: number; horizontal_bar?: number; horizontal_weight?: number
  vertical_bar?: number; vertical_weight?: number
}
interface ResultItem {
  id: number; name: string; type: string; quantity: number; height: number
  width?: number; length?: number; diameter?: number; clear_cover?: number
  area: number; volume: number; reinforcements?: ResultReinforcement[]
  stirrups?: { diameter: string; deduction: string; weight?: string; total_ring?: string; height?: string }[]
}
const props = withDefaults(defineProps<{ columns: ResultItem[]; type: string; totalVolume: number; kind?: 'column' | 'pile' | 'footing' | 'beam' | 'wall' }>(), { kind: 'column' })
const emit = defineEmits<{ (e: 'edit', data: InputItems): void; (e: 'delete', id: string): void }>()
const unitStore = useUnitStore()
const itemLabel = computed(() => ({ column: 'Column', pile: 'Pile', footing: 'Footing', beam: 'Beam', wall: 'Lift share wall' })[props.kind])
const hasShape = computed(() => ['column', 'pile', 'footing'].includes(props.kind))
const hasDimensions = computed(() => !hasShape.value || props.columns.some(column => column.type === 'Rectangle' && column.width !== undefined && column.width >= 1))
const totalReinforcementWeight = computed(() => props.columns.reduce((total, column) =>
  total + (column.reinforcements || []).reduce((sum, item) => sum + (item.weight || 0), 0), 0))
const totalStirrupWeight = computed(() => props.columns.reduce((total, column) =>
  total + (column.stirrups || []).reduce((sum, item) => sum + (Number(item.weight) || 0), 0), 0))
const linearValue = (value: number | undefined) => `${formatNumber(unitStore.convertUnit('mm', value ?? 0))} ${unitStore.targetUnit}`
const dimension = (value: number | undefined) => value !== undefined && value > 0
  ? `${formatNumber(unitStore.convertUnit('mm', value))} ${unitStore.targetUnit}`
  : 'N/A'
</script>

<style scoped>
.structural-results { color: #e2e9e7; padding: 1.15rem clamp(0.8rem, 2vw, 2rem) 1.5rem; }
.results-header, .section-heading, .card-header, .card-heading, .detail-heading { display: flex; align-items: center; }
.results-header, .section-heading, .card-header { justify-content: space-between; gap: 1rem; }
.results-header { margin: 0 0 1.35rem; }
.eyebrow { color: #8aaba4; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.13em; margin: 0 0 0.35rem; }
h1, h2, h3, h4, p { margin: 0; }
h1 { font-size: 1.5rem; font-weight: 650; letter-spacing: -0.02em; }
h2 { font-size: 1.1rem; font-weight: 650; }
h3 { font-size: 1rem; font-weight: 650; overflow-wrap: anywhere; }
h4 { font-size: 0.9rem; font-weight: 600; }
.intro, .section-description { color: #a4b3b0; font-size: 0.8rem; line-height: 1.5; margin-top: 0.35rem; }
.view-label, .shape-label { color: #afd4ca; background: #273c38; border: 1px solid #39554e; border-radius: 999px; font-size: 0.7rem; padding: 0.35rem 0.65rem; white-space: nowrap; }
.overview, .column-card { background: #232b2a; border: 1px solid #3b4845; border-radius: 0.55rem; }
.overview { padding: 1.1rem; }
.volume-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem; margin: 1rem 0; }
.metric { padding: 0.85rem 1rem; border: 1px solid #354844; border-radius: 0.4rem; background: #1b2422; }
.metric span, .column-properties span, .weight-summary span { display: block; color: #a5b6b1; font-size: 0.72rem; }
.metric strong { display: block; color: #d5eee6; font-size: 1.15rem; margin-top: 0.3rem; font-variant-numeric: tabular-nums; }
small { color: #a5b6b1; font-size: 0.72em; font-weight: 500; }
.overview-table { width: 100%; }
.overview-table .column-table { table-layout: fixed; font-size: 0.72rem; }
.overview-table .column-table th, .overview-table .column-table td { padding: 0.65rem 0.35rem; text-align: center; overflow-wrap: anywhere; }
.overview-table .column-table th { background: #303b38; color: #c3d0cc; font-weight: 600; }
.overview-table .column-table td { border-bottom: 1px solid #384340; font-variant-numeric: tabular-nums; }
.column-id { display: block; color: #a5b6b1; font-size: 0.67rem; }
.empty-state, .empty-detail { color: #a4b3b0; font-size: 0.8rem; padding: 1rem 0; }
.connected-results { margin-top: 1.7rem; }
.details-heading { margin-bottom: 1rem; }
.column-card { margin-bottom: 0.85rem; }
.card-header { padding: 1rem 1.15rem; border-bottom: 1px solid #394642; }
.card-heading { gap: 0.8rem; min-width: 0; }
.card-marker { display: block; width: 0.25rem; height: 2.4rem; border-radius: 1rem; background: #8abeb0; flex-shrink: 0; }
.column-properties { display: flex; flex-wrap: wrap; gap: 0.8rem 1.8rem; padding: 1rem 1.15rem; background: #1f2826; border-bottom: 1px solid #394642; }
.column-properties strong { display: block; color: #edf3f0; font-size: 0.84rem; margin-top: 0.3rem; font-variant-numeric: tabular-nums; }
.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr)); gap: 1rem; padding: 1.15rem; }
.detail-section { min-width: 0; }
.detail-heading { gap: 0.6rem; margin-bottom: 0.8rem; }
.detail-index { color: #8abeb0; font-size: 0.68rem; letter-spacing: 0.05em; }
.detail-table-scroll { overflow-x: auto; }
.detail-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; text-align: left; }
.detail-table th, .detail-table td { padding: 0.55rem 0.6rem; border-bottom: 1px solid #3a4743; white-space: nowrap; font-variant-numeric: tabular-nums; }
.detail-table th { color: #a5b6b1; font-weight: 500; }
.detail-table td { color: #e3eeea; }
.weight-summary { display: flex; flex-wrap: wrap; gap: 1rem 2rem; padding: 1rem 1.2rem; background: #1e2826; border: 1px solid #3b4845; border-radius: 0.5rem; }
.weight-summary strong { display: block; color: #d5eee6; margin-top: 0.3rem; font-size: 0.9rem; font-variant-numeric: tabular-nums; }
@media (max-width: 800px) { .volume-summary { grid-template-columns: 1fr; } .view-label { display: none; } .overview-table .column-table { font-size: 0.65rem; } }
</style>

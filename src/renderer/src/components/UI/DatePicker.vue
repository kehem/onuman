<template>
    <div class="datepicker-container" ref="datepickerContainer">
        <input type="text" :value="formattedDate" @focus="showCalendar = true" @input="handleInput($event)"
            @blur="validateAndUpdateDate" class="datepicker-input" :class="{ 'invalid': inputError }"
            placeholder="DD MMM, YYYY" />
        <div class="calendar-icon" @click="showCalendar = true">
            <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-61.04 -61.04 732.48 732.48" xml:space="preserve"
                transform="matrix(-1, 0, 0, 1, 0, 0)rotate(0)">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC"
                    stroke-width="18.31194"></g>
                <g id="SVGRepo_iconCarrier">
                    <g>
                        <g>
                            <path
                                d="M159.567,0h-15.329c-1.956,0-3.811,0.411-5.608,0.995c-8.979,2.912-15.616,12.498-15.616,23.997v10.552v27.009v14.052 c0,2.611,0.435,5.078,1.066,7.44c2.702,10.146,10.653,17.552,20.158,17.552h15.329c11.724,0,21.224-11.188,21.224-24.992V62.553 V35.544V24.992C180.791,11.188,171.291,0,159.567,0z">
                            </path>
                            <path
                                d="M461.288,0h-15.329c-11.724,0-21.224,11.188-21.224,24.992v10.552v27.009v14.052c0,13.804,9.5,24.992,21.224,24.992 h15.329c11.724,0,21.224-11.188,21.224-24.992V62.553V35.544V24.992C482.507,11.188,473.007,0,461.288,0z">
                            </path>
                            <path
                                d="M539.586,62.553h-37.954v14.052c0,24.327-18.102,44.117-40.349,44.117h-15.329c-22.247,0-40.349-19.79-40.349-44.117 V62.553H199.916v14.052c0,24.327-18.102,44.117-40.349,44.117h-15.329c-22.248,0-40.349-19.79-40.349-44.117V62.553H70.818 c-21.066,0-38.15,16.017-38.15,35.764v476.318c0,19.784,17.083,35.764,38.15,35.764h468.763c21.085,0,38.149-15.984,38.149-35.764 V98.322C577.735,78.575,560.671,62.553,539.586,62.553z M527.757,557.9l-446.502-0.172V173.717h446.502V557.9z">
                            </path>
                            <path
                                d="M353.017,266.258h117.428c10.193,0,18.437-10.179,18.437-22.759s-8.248-22.759-18.437-22.759H353.017 c-10.193,0-18.437,10.179-18.437,22.759C334.58,256.074,342.823,266.258,353.017,266.258z">
                            </path>
                            <path
                                d="M353.017,348.467h117.428c10.193,0,18.437-10.179,18.437-22.759c0-12.579-8.248-22.758-18.437-22.758H353.017 c-10.193,0-18.437,10.179-18.437,22.758C334.58,338.288,342.823,348.467,353.017,348.467z">
                            </path>
                            <path
                                d="M353.017,430.676h117.428c10.193,0,18.437-10.18,18.437-22.759s-8.248-22.759-18.437-22.759H353.017 c-10.193,0-18.437,10.18-18.437,22.759S342.823,430.676,353.017,430.676z">
                            </path>
                            <path
                                d="M353.017,512.89h117.428c10.193,0,18.437-10.18,18.437-22.759c0-12.58-8.248-22.759-18.437-22.759H353.017 c-10.193,0-18.437,10.179-18.437,22.759C334.58,502.71,342.823,512.89,353.017,512.89z">
                            </path>
                            <path
                                d="M145.032,266.258H262.46c10.193,0,18.436-10.179,18.436-22.759s-8.248-22.759-18.436-22.759H145.032 c-10.194,0-18.437,10.179-18.437,22.759C126.596,256.074,134.838,266.258,145.032,266.258z">
                            </path>
                            <path
                                d="M145.032,348.467H262.46c10.193,0,18.436-10.179,18.436-22.759c0-12.579-8.248-22.758-18.436-22.758H145.032 c-10.194,0-18.437,10.179-18.437,22.758C126.596,338.288,134.838,348.467,145.032,348.467z">
                            </path>
                            <path
                                d="M145.032,430.676H262.46c10.193,0,18.436-10.18,18.436-22.759s-8.248-22.759-18.436-22.759H145.032 c-10.194,0-18.437,10.18-18.437,22.759S134.838,430.676,145.032,430.676z">
                            </path>
                            <path
                                d="M145.032,512.89H262.46c10.193,0,18.436-10.18,18.436-22.759c0-12.58-8.248-22.759-18.436-22.759H145.032 c-10.194,0-18.437,10.179-18.437,22.759C126.596,502.71,134.838,512.89,145.032,512.89z">
                            </path>
                        </g>
                    </g>
                </g>
            </svg>
        </div>

        <div v-if="showCalendar" class="calendar-popup" @click.self="showCalendar = false">
            <div class="calendar">
                <div class="calendar-header">
                    <button type="button" @click="prevMonth"><i class="m-chevron-left"></i></button>
                    <div class="header-center">
                        <span>{{ monthNames[currentMonth] }}</span>
                        <select v-model="currentYear" class="year-select">
                            <option v-for="year in yearRange" :key="year" :value="year">{{ year }}</option>
                        </select>
                    </div>
                    <button type="button" @click="nextMonth"><i class="m-chevron-right"></i></button>
                </div>

                <div class="calendar-grid-container">
                    <transition :name="slideDirection">
                        <div class="calendar-grid" :key="calendarKey">
                            <div class="calendar-day" v-for="day in weekDays" :key="day">{{ day }}</div>
                            <div class="calendar-date" v-for="date in dates" :key="date.key" :class="{
                                today: isToday(date),
                                selected: isSelected(date),
                                disabled: isDisabled(date)
                            }" @click="selectDate(date)">
                                {{ date.day }}
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// DEFINE EMITS FOR TWO-WAY BINDING
const emit = defineEmits<{
    (e: 'update:selectedDate', value: Date | null): void
    (e: 'update:startFrom', value: Date | null): void
    (e: 'update:endDate', value: Date | null): void
}>()

// DEFINE PROPS FOR SELECTED DATE, START DATE, AND END DATE
const props = defineProps<{
    selectedDate?: Date | null
    startFrom?: Date | null
    endDate?: Date | null
}>()

// REACTIVE STATE
const showCalendar = ref(false)
const currentDate = new Date()
const currentMonth = ref(currentDate.getMonth())
const currentYear = ref(currentDate.getFullYear())
const slideDirection = ref('slide-left')
const calendarKey = ref(0)
// INITIALIZE WITH NULL IF NO SELECTED DATE IS PROVIDED
const internalSelectedDate = ref<Date | null>(props.selectedDate ?? null)
const datepickerContainer = ref<HTMLElement | null>(null)
const inputError = ref(false)
const inputValue = ref('')

// CONSTANTS
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
] as const

// COMPUTED YEAR RANGE FOR DROPDOWN
const yearRange = computed(() => {
    const startYear = props.startFrom ? props.startFrom.getFullYear() : currentYear.value - 10
    const endYear = props.endDate ? props.endDate.getFullYear() : currentYear.value + 10
    const years: number[] = []
    for (let year = startYear; year <= endYear; year++) {
        years.push(year)
    }
    return years
})

// TYPES
interface CalendarDate {
    key: string
    day: number | ''
    month: number
    year: number
}

// COMPUTED PROPERTIES
// FORMAT DATE AS "DD MMM, YYYY" (E.G., "14 May, 2025")
const formattedDate = computed(() => {
    if (!internalSelectedDate.value) return inputValue.value
    const date = internalSelectedDate.value
    const day = date.getDate().toString().padStart(2, '0')
    const month = monthNames[date.getMonth()].slice(0, 3)
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
})

// GENERATE CALENDAR DATES
const dates = computed<CalendarDate[]>(() => {
    const dates: CalendarDate[] = []
    const firstDay = new Date(currentYear.value, currentMonth.value, 1)
    const startDay = firstDay.getDay()
    const totalDays = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()

    // ADD EMPTY SLOTS BEFORE FIRST DAY
    for (let i = 0; i < startDay; i++) {
        dates.push({ key: `e-${i}`, day: '', month: currentMonth.value, year: currentYear.value })
    }

    // ADD ACTUAL DATES
    for (let day = 1; day <= totalDays; day++) {
        dates.push({ key: `d-${day}`, day, month: currentMonth.value, year: currentYear.value })
    }

    return dates
})

// METHODS
// CHECK IF DATE IS TODAY
function isToday(date: CalendarDate): boolean {
    const today = new Date()
    return date.day !== '' &&
        date.day === today.getDate() &&
        date.month === today.getMonth() &&
        date.year === today.getFullYear()
}

// CHECK IF DATE IS SELECTED
function isSelected(date: CalendarDate): boolean {
    return !!internalSelectedDate.value &&
        date.day !== '' &&
        date.day === internalSelectedDate.value.getDate() &&
        date.month === internalSelectedDate.value.getMonth() &&
        date.year === internalSelectedDate.value.getFullYear()
}

// CHECK IF DATE IS DISABLED BASED ON STARTFROM AND ENDDATE
function isDisabled(date: CalendarDate): boolean {
    if (date.day === '') return false
    const dateObj = new Date(date.year, date.month, date.day)
    if (props.startFrom && dateObj < props.startFrom) return true
    if (props.endDate && dateObj > props.endDate) return true
    return false
}

// PARSE DATE STRING IN "DD MMM, YYYY" FORMAT
function parseDateString(dateStr: string): Date | null {
    const regex = /^(\d{2})\s([A-Za-z]{3}),\s(\d{4})$/
    const match = dateStr.trim().match(regex)
    if (!match) return null

    const day = parseInt(match[1], 10)
    const monthStr = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase()
    const year = parseInt(match[3], 10)

    const monthIndex = monthNames.findIndex(m => m.toLowerCase().startsWith(monthStr.toLowerCase()))
    if (monthIndex === -1 || isNaN(day) || isNaN(year) || day < 1 || day > 31) return null

    const date = new Date(year, monthIndex, day)
    if (isNaN(date.getTime())) return null

    // CHECK IF DATE IS WITHIN STARTFROM AND ENDDATE
    if (props.startFrom && date < props.startFrom) return null
    if (props.endDate && date > props.endDate) return null

    return date
}

// HANDLE INPUT EVENT
function handleInput(event: Event): void {
    inputValue.value = (event.target as HTMLInputElement).value
    inputError.value = false
}

// VALIDATE AND UPDATE DATE ON BLUR
function validateAndUpdateDate(): void {
    if (!inputValue.value) {
        internalSelectedDate.value = null
        emit('update:selectedDate', null)
        inputError.value = false
        return
    }

    const parsedDate = parseDateString(inputValue.value)
    if (parsedDate) {
        internalSelectedDate.value = parsedDate
        emit('update:selectedDate', parsedDate)
        inputError.value = false
        // UPDATE CALENDAR VIEW
        currentMonth.value = parsedDate.getMonth()
        currentYear.value = parsedDate.getFullYear()
    } else {
        inputError.value = true
    }
}

// SELECT A DATE AND EMIT UPDATE
function selectDate(date: CalendarDate): void {
    if (date.day === '' || isDisabled(date)) return
    const newDate = new Date(date.year, date.month, date.day)
    internalSelectedDate.value = newDate
    emit('update:selectedDate', newDate)
    inputValue.value = formattedDate.value
    inputError.value = false
    showCalendar.value = false
}

// NAVIGATE TO PREVIOUS MONTH
function prevMonth(): void {
    slideDirection.value = 'slide-right'
    if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
    } else {
        currentMonth.value--
    }
    calendarKey.value++
}

// NAVIGATE TO NEXT MONTH
function nextMonth(): void {
    slideDirection.value = 'slide-left'
    if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
    } else {
        currentMonth.value++
    }
    calendarKey.value++
}

// HANDLE CLICK OUTSIDE TO CLOSE POPUP
function handleClickOutside(event: MouseEvent): void {
    if (
        datepickerContainer.value &&
        !datepickerContainer.value.contains(event.target as Node) &&
        showCalendar.value
    ) {
        showCalendar.value = false
    }
}

// ADD AND REMOVE CLICK OUTSIDE LISTENER
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    // EMIT INITIAL SELECTED DATE IF PROVIDED
    if (props.selectedDate && internalSelectedDate.value) {
        emit('update:selectedDate', internalSelectedDate.value)
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
@use "sass:color";

// COLOR VARIABLES
$primary-bg: #383838; // INPUT AND SELECT BACKGROUND
$secondary-bg: #3a3a3a; // CALENDAR POPUP BACKGROUND
$primary-text: #e0e0e0; // PRIMARY TEXT COLOR
$secondary-text: #a0a0a0; // WEEKDAY AND BUTTON COLOR
$disabled-text: #535353; // DISABLED DATE COLOR
$border: #4d4d4d; // DEFAULT BORDER COLOR
$border-hover: #1de0c6; // HOVER/FOCUS BORDER COLOR
$highlight: #1de0c6; // SELECTED/TODAY HIGHLIGHT
$highlight-text: #1f1f1f; // TEXT ON HIGHLIGHTED BACKGROUND
$error: #d43333; // INVALID INPUT BORDER
$placeholder: #a4a4a4; // PLACEHOLDER TEXT
$shadow: rgba(0, 0, 0, 0.5); // SHADOW COLOR
$shadow-highlight: rgba(29, 224, 198, 0.2); // INPUT FOCUS SHADOW
$shadow-error: rgba(212, 51, 51, 0.2); // INVALID INPUT SHADOW

// STYLING FOR DATEPICKER CONTAINER
.datepicker-container {
    position: relative;
    z-index: 5;
    margin-top: 0.3rem !important;

    // CALENDAR ICON STYLING
    .calendar-icon {
        position: absolute;
        right: 0.3rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1.1rem;
        z-index: 1;
        cursor: pointer;

        svg {
            fill: $placeholder;
            transition: fill 0.2s ease;

            &:hover {
                fill: $border-hover;
            }
        }
    }

    // INPUT FIELD STYLING
    .datepicker-input {
        padding: 8px 2rem 8px 12px; // ADJUST PADDING FOR ICON
        font-size: 16px;
        min-width: 11rem;
        height: 2.1rem;
        cursor: pointer;
        background-color: color.adjust($primary-bg, $lightness: 4%);
        color: $primary-text;
        border: 1px solid $border;
        border-radius: 4px;
        outline: none;

        &:focus {
            outline: none;
            border-color: $border-hover;
            box-shadow: 0 0 0 2px $shadow-highlight;
        }

        // INVALID INPUT STYLING
        &.invalid {
            border-color: $error;
            box-shadow: 0 0 0 1px $shadow-error;
        }

        // PLACEHOLDER STYLING
        &::placeholder {
            color: $placeholder;
            font-size: 0.8rem;
        }
    }

    // CALENDAR POPUP STYLING
    .calendar-popup {
        position: absolute;
        top: 45px;
        z-index: 1000;
        background: $secondary-bg;
        border-radius: 8px;
        box-shadow: 0 4px 12px $shadow;
        border: 1px solid $border;

        // CALENDAR CONTENT
        .calendar {
            width: 260px;
            padding: 16px;

            // HEADER WITH MONTH/YEAR AND NAVIGATION
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                color: $primary-text;

                // CENTER CONTAINER FOR MONTH AND YEAR
                .header-center {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: bold;

                    // MONTH DISPLAY
                    span {
                        color: $primary-text;
                    }

                    // YEAR DROPDOWN
                    .year-select {
                        background: $primary-bg;
                        color: $primary-text;
                        border: 1px solid $border;
                        border-radius: 4px;
                        padding: 0 0.8rem;
                        font-size: 14px;
                        cursor: pointer;
                        appearance: none;
                        transition: border-color 0.2s ease;
                        max-height: 2rem;
                        overflow-y: auto;

                        // CUSTOM SCROLLBAR STYLING
                        &::-webkit-scrollbar {
                            width: 4px;
                        }

                        &::-webkit-scrollbar-track {
                            background: $secondary-bg;
                            border-radius: 3px;
                        }

                        &::-webkit-scrollbar-thumb {
                            background: $border;
                            border-radius: 3px;
                        }

                        &::-webkit-scrollbar-thumb:hover {
                            background: color.adjust($border, $lightness: 10%);
                        }

                        &:hover,
                        &:focus {
                            border-color: $border;
                            outline: none;
                        }
                    }
                }

                // NAVIGATION BUTTONS
                button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    color: $secondary-text;
                    transition: color 0.2s ease;

                    &:hover {
                        color: $border-hover;
                    }
                }
            }

            // GRID CONTAINER FOR DATES
            .calendar-grid-container {
                position: relative;
                overflow: hidden;
                height: 180px;

                // GRID OF DAYS AND DATES
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 6px;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;

                    // WEEKDAY LABELS
                    .calendar-day {
                        font-weight: bold;
                        text-align: center;
                        color: $secondary-text;
                    }

                    // INDIVIDUAL DATE CELLS
                    .calendar-date {
                        text-align: center;
                        padding: 6px 0;
                        border-radius: 4px;
                        color: $primary-text;
                        transition: background 0.2s ease, color 0.2s ease;

                        // HOVER EFFECT FOR NON-DISABLED DATES
                        &:hover:not(.disabled) {
                            background-color: color.adjust($primary-bg, $lightness: -5%);
                            cursor: pointer;
                        }

                        // TODAY'S DATE STYLING
                        &.today {
                            border: 1px solid $border-hover;
                            color: $border-hover;
                        }

                        // SELECTED DATE STYLING
                        &.selected {
                            background-color: $highlight;
                            color: $highlight-text;
                        }

                        // DISABLED DATE STYLING
                        &.disabled {
                            color: $disabled-text !important;
                            cursor: not-allowed !important;
                            background: transparent !important;
                        }
                    }
                }
            }
        }
    }
}

// SLIDE TRANSITION FOR MONTH NAVIGATION
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-right-leave-to {
    transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter-from {
    transform: translateX(-100%);
}
</style>


<!-- <DatePicker v-model:selectedDate="selectedDate" />
<p>Selected Date: {{ selectedDate?.toDateString() }}</p>
<p>Start From: {{ startFrom?.toDateString() }}</p>
<p>End Date: {{ endDate?.toDateString() }}</p> 
const selectedDate = ref<Date | null>(new Date()) // TODAY
const startFrom = ref<Date | null>(new Date(2025, 0, 10)) // 10 JANUARY 2025
const endDate = ref<Date | null>(new Date(2028, 0, 10)) // 10 JANUARY 2028
-->
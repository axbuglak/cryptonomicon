<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <add-ticker
        @add-ticker="add"
        :tickerList="tickerList"
        v-model:filterValue="filter"
      />
      <template v-if="tickerList.length">
        <div>
          <div class="flex gap-x-2">
            <button
              @click="page = Number(page) + 1"
              v-if="hasNextPage"
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Вперед</button
            ><button
              v-if="page > 1"
              @click="page = page - 1"
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Назад
            </button>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer relative"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-300': t.error
            }"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd
                class="mt-1 text-3xl font-semibold text-gray-900 transition-all"
              >
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="removeHandler(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <graph-ticker
        :graph="graph"
        :selectedTicker="selectedTicker"
        @maxGraphElements="setMaxGraphElements"
        @close-graph="() => (this.selectedTicker = null)"
      />
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from './api.js'
import addTicker from './components/AddTicker.vue'
import graphTicker from './components/GraphTicker.vue'
export default {
  name: 'App',

  components: {
    addTicker,
    graphTicker
  },

  data() {
    return {
      ticker: '',
      tickerList: [],
      selectedTicker: null,
      graph: [],
      page: 1,
      filter: '',
      error: '',
      maxGraphElements: 1
    }
  },

  computed: {
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      }
    },
    startIndex() {
      return (this.page - 1) * 6
    },
    endIndex() {
      return this.page * 6
    },
    filteredTickers() {
      return this.tickerList.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      )
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex)
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex
    }
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    ) // берем из урлы паарметры фильтра и страницы и присваиваем их
    if (windowData.filter) {
      this.filter = windowData.filter
    }
    if (windowData.page) {
      this.page = windowData.page
    }

    const tickerData = localStorage.getItem('tickerList') // берем тикеты из локалстореджа
    if (tickerData) {
      this.tickerList = JSON.parse(tickerData)
      this.tickerList.forEach((ticker) => {
        subscribeToTicker(ticker.name, (price, error) => {
          if (error) {
            ticker.error = true
          } else {
            this.updateTickers(ticker.name, price)
          }
        })
      })
    }
  },
  methods: {
    setMaxGraphElements(m) {
      this.maxGraphElements = m
    },
    updateTickers(tickerName, price) {
      this.tickerList
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push(price)

            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift()
            }
          }
          if (price) {
            t.price = price
          } else {
            t.price = '-'
          }
        })
    },
    formatPrice(price) {
      if (price == '-') {
        return price
      }
      if (Number.isFinite(price)) {
        return price > 1 ? price.toFixed(3) : price.toPrecision(3)
      }
    },

    add(tickName) {
      const currentTicker = {
        name: tickName.toUpperCase(),
        price: '-'
      }

      this.tickerList = [...this.tickerList, currentTicker]
      subscribeToTicker(currentTicker.name, (price, error) => {
        if (error) {
          currentTicker.error = true
        } else {
          this.updateTickers(currentTicker.name, price)
        }
      })
    },
    select(ticker) {
      if (ticker.error) {
        return
      }
      this.selectedTicker = ticker
    },
    removeHandler(tickerToRemove) {
      this.tickerList = this.tickerList.filter((t) => t !== tickerToRemove)
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null
      }
      unsubscribeFromTicker(tickerToRemove.name)
    }
  },
  watch: {
    error() {
      setTimeout(() => {
        this.error = ''
      }, 5000)
    },
    selectedTicker() {
      this.graph = []
      this.$nextTick().then(this.calculateMaxGraphElement)
    },
    tickerList() {
      localStorage.setItem('tickerList', JSON.stringify(this.tickerList))
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1
      }
    },
    filter() {
      this.page = 1
    },
    pageStateOptions(v) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${v.filter}&page=${v.page}`
      )
    }
  }
}
</script>

<style></style>
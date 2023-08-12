<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add(ticker)"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
          <span
            v-for="(coin, index) in this.ticker === ''
              ? [
                  { Symbol: 'BTC' },
                  { Symbol: 'ETH' },
                  { Symbol: 'DOGE' },
                  { Symbol: 'BNB' }
                ]
              : coinsList
                  .filter((tick) =>
                    tick.Symbol.includes(this.ticker.toUpperCase())
                  )
                  .slice(0, 4)"
            :key="index"
            @click="add(coin.Symbol)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ coin.Symbol }}
          </span>
        </div>
        <div class="text-sm text-red-600" v-if="error">
          {{ error }}
        </div>
        <add-button @onAdd-ticker="add(ticker)" />
      </div>
    </div>
    <div>
      Фильтр:
      <input
        :value="filterValue"
        @input="$emit('update:filterValue', $event.target.value)"
        class="pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
      />
    </div>
  </section>
</template>

<script>
import AddButton from './AddButton.vue'
import { loadCoins } from '../api.js'

export default {
  name: 'AddTickerSection',
  components: {
    AddButton
  },
  data() {
    return {
      ticker: '',
      coinsList: [],
      error: ''
    }
  },
  created() {
    async function fetchCoins(coins) {
      const coinsData = await loadCoins()

      coinsData.forEach((coin) => {
        coins.push({ Symbol: coin })
      })
    }
    fetchCoins(this.coinsList)
  },

  props: {
    tickerList: {
      type: Array,
      default: () => []
    },
    filterValue: {
      type: String,
    }
  },

  emits: ['update:filterValue'],

  methods: {
    add(coin) {
      if (!this.coinsList.find((t) => t.Symbol == coin.toUpperCase())) {
        if (this.ticker === '') return (this.error = 'Введите название монетки')
        return (this.error = 'Такой монетки не существует')
      }

      if (this.tickerList.find((t) => t.name === coin)) {
        return (this.error = 'Такая монетка уже есть')
      }
      this.$emit('add-ticker', coin)
      this.ticker = ''
      this.error = ''
    }
  }
}
</script>
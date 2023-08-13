<template>
  <div>
    <div class="flex gap-x-2">
      <button
        @click="$emit('to-next-page')"
        v-if="hasNextPage"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Вперед</button
      ><button
        v-if="page > 1"
        @click="$emit('to-prev-page')"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Назад
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filteredTickers: {
      type: Array,
      default: () => []
    },
    page: {
      type: Number,
      default: () => 1
    }
  },

  emits: ['paginatedTickers'],

  created() {
    this.$emit('paginatedTickers', this.paginatedTickers)
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6
    },
    endIndex() {
      return this.page * 6
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex)
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex
    }
  },

  watch: {
    paginatedTickers() {
      this.$emit('paginatedTickers', this.filteredTickers.slice(this.startIndex, this.endIndex))
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.$emit('to-prev-page')
      }
    },
  }
}
</script>
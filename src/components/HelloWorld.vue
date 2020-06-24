<template lang="html">
  <div class="test">
  
  <vue-request requestKey="getData" :fetcher="getData">
    <template v-slot="{ state, run, runFactory, cancel }">
      <div class="search">
        <input type="text" v-model="search.words"/>
        <button @click="run(search.words)" :disabled="state.loading">search</button>
        <button @click="runFactory(loadMore)(search.words)" :disabled="state.loading">search load more</button>
        <button @click="cancel">cancel</button>
      </div>
      <div class="result">
        <div v-if="state.loading">加载中。。。</div>
        <div v-if="state.error">{{ state.error }}</div>
        <div v-if="state.data">
          <h2>搜索记录</h2>
          <div :key="query" v-for="query in state.data">{{query}}</div>
        </div>
      </div>
    </template>
  </vue-request>

  <!-- <vue-request requestKey="getData">
    <template v-slot="{ state, run }">
      <div class="search">
        <input type="text" v-model="search.words"/>
        <button @click="run(search.words)" :disabled="state.loading">search</button>
      </div>
      <div class="result">
        <div v-if="state.loading">加载中。。。</div>
        <div v-if="state.data">{{ state.data }}</div>
        <div v-if="state.error">{{ state.error }}</div>
      </div>
    </template>
  </vue-request> -->
  </div>
</template>

<script>
import { VueRequest } from '../index'

export default {
  components: {
    VueRequest,
  },
  data () {
    return {
      search: {
        words: '',
      },
    }
  },
  methods: {
    loadMore (state, data) {
      if (!state.data) {
        state.data = data
      }
      else {
        state.data = [...state.data, ...data]
      }
    },
    getData (words = '') {
      return new Promise( (resolve, reject) => {
        setTimeout( () => {
          if (this.search.words === 'error') {
            reject('网络错误')
          }
          else {
            resolve([words +  ~~(Math.random() * 100)])
          }
        }, 1000)
      })
    }
  },
}
</script>
<template lang="html">
  <div class="test">
  
  <vue-request requestKey="getData" :fetcher="getData" manual :debounceWait="1000" :debounceOptions="{leading:true}" :throttleWait="1000">
    <template v-slot="{ state, run, cancel, reset, runDebounce, }">
      <div class="search">
        <input type="text" v-model="search.words" @input="cancel(),runDebounce()"/>
        <button @click="run(search.words)" :disabled="state.loading">search</button>
        <button @click="cancel();run(search.words)">research</button>
        <button @click="run(loadMore, search.words)" :disabled="state.loading">search load more</button>
        <button @click="cancel">cancel</button>
        <button @click="reset">reset</button>
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
      console.log('getData')
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
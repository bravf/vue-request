import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'
const VueRequestMap = {
  // requestKey: {
  //   run () => {},
  //   cancel () => {},
  //   fetcher () => {},
  //   state: {
  //     loading: false,
  //     error: null,
  //     data: null,
  //     promise: null,
  //   }
  // }
}
export const VueRequest = {
  props: {
    requestKey: String,
    fetcher: {
      type: Function,
      default: () => {
        return Promise.resolve()
      }
    },
    tag: {
      type: String,
      default: 'div',
    },
    manual: {
      type: Boolean,
      default: false,
    },
    debounceWait: {
      type: Number,
      default: 0,
    },
    debounceOptions: Object,
    throttleWait: {
      type: Number,
      default: 0,
    },
    throttleOptions: Object,
  },
  data () {
    return {
      request: null,
    }
  },
  methods: {
    createRequest () {
      const dataHandler = (state, data) => {
        state.data = data
      }
      let request = {
        fetcher: this.fetcher,
        cancel: () => {
          request.state.loading = false
          request.state.promise = null
        },
        reset: () => {
          request.state.loading = false
          request.state.promise = null
          request.state.error = null
          request.state.data = null
        },
        state: {
          loading: false,
          error: null,
          data: null,
          promise: null,
        },
      }
      const run = (...args) => {
        const isResetHandler = typeof args[0] === 'function'
        const handler = isResetHandler ? args[0] : dataHandler
        const fetcherArgs = isResetHandler ? args.slice(1) : args
        const { fetcher, state } = request
        // 处理竞争
        if (state.loading) {
          return
        }
        state.loading = true
        const promise = state.promise = fetcher(...fetcherArgs).then(data => {
          if (promise !== state.promise) {
            return
          }
          handler(state, data)
          state.loading = false
        }).catch(err => {
          if (promise !== state.promise) {
            return
          }
          state.error = err
          state.loading = false
        })
      }
      request = {
        ...request,
        run,
        runDebounce: debounce(run, this.debounceWait, this.debounceOptions),
        runThrottle: throttle(run, this.throttleWait, this.throttleOptions),
      }
      return request
    },
    getRequest () {
      if (this.requestKey) {
        if (this.requestKey in VueRequestMap) {
          this.request = VueRequestMap[this.requestKey]
        }
        else {
          this.request = VueRequestMap[this.requestKey] = this.createRequest()
        }
      }
      else  {
        this.request = this.createRequest()
      }
    },
    getVNode (h) {
      const request = this.request
      if (this.$scopedSlots.default) {
        const $node = this.$scopedSlots.default({
          ...request,
        })
        if ($node && ($node.length > 1 || !$node[0].tag)) {
          return h(this.tag, $node)
        }
        return $node
      }
      return null
    }
  },
  render (h) {
    return this.getVNode(h)
  },
  created () {
    this.getRequest()
    if (!this.manual) {
      this.request.run()
    }
  }
}
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
      const request = {
        fetcher: this.fetcher,
        run: (...args) => {
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
        },
        cancel: () => {
          request.state.loading = false
          request.state.promise = null
        },
        state: {
          loading: false,
          error: null,
          data: null,
          promise: null,
        },
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
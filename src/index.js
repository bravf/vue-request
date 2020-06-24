const VueRequestMap = {
  // requestKey: {
  //   run () => {},
  //   runFactory () => {},
  //   cancel () => {},
  //   fetcher () => {},
  //   state: {
  //     loading: false,
  //     error: null,
  //     data: null,
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
      let request = {
        fetcher: this.fetcher,
        run: () => {},
        cancel: () => {
          request.state.loading = false
        },
        state: {
          loading: false,
          error: null,
          data: null,
        },
      }
      const runFactory = (handler = dataHandler) => {
        return (...args) => {
          const { fetcher, state } = request
          // 处理竞争
          if (state.loading) {
            return
          }
          state.loading = true
          fetcher(...args).then(data => {
            // 如果被 cancel 了，不执行结果
            if (!state.loading) {
              return
            }
            handler(state, data)
            state.loading = false
          }).catch(err => {
            if (!state.loading) {
              return
            }
            state.error = err
            state.loading = false
          })
        }
      }
      request = {
        ...request,
        run: runFactory(),
        runFactory,
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
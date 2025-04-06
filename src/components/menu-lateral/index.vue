<template lang="pug">
div
  link(
    href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css"
    rel="stylesheet"
  )
  v-navigation-drawer.appDrawer(
    v-if="hasNavDrawer"
    v-model="drawer"
    v-bind="drawerConfigs"
    :mini-variant.sync="mini"
    :mobile-breakpoint="960"
    width=255
  )
    template(#prepend)
      v-row.ma-0(
        align="center"
        :class="mini ? 'py-6 justify-center' : 'pa-6 justify-space-between'"
      )
        v-col.pa-0(v-if="!mini" cols="auto")
          v-img(
            v-if="!mini"
            :src="infos.images.logo"
            max-width="156"
          )
        v-col.pa-0(cols="auto")
          v-btn(
            v-if="mini"
            icon
            @click.stop="mini = !mini"
          )
            v-icon mdi-chevron-double-right
          v-btn(
            v-else
            icon
            @click.stop="mini = !mini"
          )
            v-icon mdi-chevron-double-left
    qt-menu(
      colorItemSelect="primary"
      listPadding="pa-2"
      marginTop="mt-2"
      dividerMarginTop="mt-2"
      subheaderClasses="uppercase"
      itemMenuFont="text-body-2"
      :dense="true"
      :nav="true"
      :showDivider="true"
      :flat="false"
    )
    template(#append)
      v-menu(offset-y top)
        template(v-slot:activator="{ on, attrs }")
          v-list.py-0(dense)
            v-list-item.my-0.py-2(
              v-on="on"
              v-bind="attrs"
              link
            )
              qt-avatar(
                :src="profileImage"
                color="primary"
                size=32
                :username="profileName"
              )
              v-list-item-content
                v-list-item-title.pl-3.text-body-2 {{ profileName }}
              v-list-item-icon
                v-icon mdi-dots-vertical
        v-list(v-for="(item, index) in menuProfile" :key="index")
          v-list-item(@click="item.click")
            v-icon.pr-2 {{ item.icon }}
            v-list-item-title {{ item.title }}
</template>
<script>
import { mapGetters, mapState } from 'vuex'

const script = document.createElement('script')
script.type = 'text/javascript'
script.async = true
script.src = 'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js'
document.head.appendChild(script)

export default {
  name: 'erudio-app-drawer',
  components: {},
  props: {},
  data() {
    return {
      drawer: true,
      menuProfile: [
        {
          title: 'Perfil',
          icon: 'mdi-account-box',
          click: (e) => {
            this.$router.push({ name: 'UserProfile', params: { userId: 'Me' } })
          }
        },
        {
          title: 'Sair',
          icon: 'mdi-logout-variant',
          click: (e) => {
            this.$store.dispatch('auth/logout')
          }
        }
      ]
    }
  },
  mounted() {
    // this.$store.commit('route/updateField', {
    //   path: 'routeMeta.hasNavDrawer',
    //   value: false
    // })
  },
  computed: {
    ...mapGetters('organization', ['infos']),
    ...mapState(['menus']),
    ...mapState(['user']),
    mini: {
      get() {
        return this.$store.state.menus.mini
      },
      set(value) {
        this.$store.dispatch('menus/toggleMini', value)
      }
    },
    profileImage() {
      return this.user?.me?.image?.url
    },
    profileName() {
      const names = this.user?.me?.name.split(' ')
      return names[0] + ' ' + names[names.length - 1]
    },
    fullProfileName() {
      return this.user?.me?.name
    },
    profileEmail() {
      return this.user?.me?.email
    },
    drawerConfigs() {
      const configs = this.infos?.drawerConfigs?.reduce(
        (acc, next) => ({ ...acc, [next.id]: next.value }),
        {}
      )
      if (this.$vuetify.breakpoint.smAndDown) {
        configs.permanent = false
      }
      return configs
    },
    hasNavDrawer() {
      const menuItems = (this.menus.list.drawer || []).filter(
        (x) => !x.deleted && x.enabled && !x.parentId
      )
      const breakpointName = this.$vuetify.breakpoint.name
      const menus = menuItems.map((x) => {
        return {
          ...x,
          hide: x.breakpointsToHide.includes(breakpointName)
        }
      })
      const alreadyListed = this.menus.alreadyListed?.drawer
      return !alreadyListed || !!menus.filter((x) => !x.hide).length
    }
  },
  methods: {
    gotToCourses() {
      this.$router.push({ path: 'cursos' })
      // return this.$store.dispatch('route/openExtension', { path: 'cursos' })
    }
  }
}
</script>

<style scoped>
.appDrawer {
  overflow: hidden;
}
.drawer-menu--scroll {
  height: 100%;
  overflow: auto;
}
.colorGrey {
  color: #616161;
}
</style>

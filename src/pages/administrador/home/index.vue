<template lang="pug">
v-container
  v-row
    v-col(cols="12")
      h1.text-h4.mb-4 Painel Administrativo

  v-row
    v-col(cols="12" md="4")
      v-card.mb-4
        v-card-text
          v-row(align="center")
            v-col(cols="auto")
              v-icon.mr-4(color="success" size="48") mdi-cash-check
            v-col
              .text-h4 {{ formatCurrency(stats.received) }}
              .text-subtitle-1 Pagamentos Recebidos

    v-col(cols="12" md="4")
      v-card.mb-4
        v-card-text
          v-row(align="center")
            v-col(cols="auto")
              v-icon.mr-4(color="warning" size="48") mdi-cash-clock
            v-col
              .text-h4 {{ formatCurrency(stats.pending) }}
              .text-subtitle-1 Pagamentos Pendentes

    v-col(cols="12" md="4")
      v-card.mb-4
        v-card-text
          v-row(align="center")
            v-col(cols="auto")
              v-icon.mr-4(color="info" size="48") mdi-chart-line
            v-col
              .text-h4 {{ formatCurrency(stats.total) }}
              .text-subtitle-1 Total de Pagamentos

  v-row
    v-col(cols="12")
      h2.text-h5.mb-4 Gerenciamento

  v-row
    v-col(cols="12" md="4")
      v-card.mb-4(hover @click="navigateTo('admnistrador-alunos')")
        v-card-title
          v-row(align="center")
            v-col(cols="auto")
              v-icon(color="primary" size="36") mdi-account-group
            v-col
              .text-h6 Gestão de Alunos
        v-card-text
          | Cadastre, edite e gerencie os alunos da instituição.
        v-card-actions
          v-spacer
          v-btn(color="primary" text)
            | Acessar
            v-icon(right) mdi-arrow-right

    v-col(cols="12" md="4")
      v-card.mb-4(hover @click="navigateTo('admnistrador-turmas')")
        v-card-title
          v-row(align="center")
            v-col(cols="auto")
              v-icon(color="primary" size="36") mdi-school
            v-col
              .text-h6 Gestão de Turmas
        v-card-text
          | Crie e gerencie turmas, horários e professores.
        v-card-actions
          v-spacer
          v-btn(color="primary" text)
            | Acessar
            v-icon(right) mdi-arrow-right

    v-col(cols="12" md="4")
      v-card.mb-4(hover @click="navigateTo('administrador-financas')")
        v-card-title
          v-row(align="center")
            v-col(cols="auto")
              v-icon(color="primary" size="36") mdi-cash-multiple
            v-col
              .text-h6 Gestão Financeira
        v-card-text
          | Controle pagamentos, mensalidades e relatórios financeiros.
        v-card-actions
          v-spacer
          v-btn(color="primary" text)
            | Acessar
            v-icon(right) mdi-arrow-right

  v-row
    v-col(cols="12")
      h2.text-h5.mb-4 Gráfico de Pagamentos

  v-row
    v-col(cols="12")
      v-card
        v-card-text
          canvas#paymentsChart(height="300")
</template>

<script>
import { sisgescAPI } from '@/api/index'
// import Chart from 'chart.js/auto'

export default {
  name: 'AdministradorHomePage',
  data() {
    return {
      stats: {
        received: 0,
        pending: 0,
        total: 0
      },
      chart: null
    }
  },
  async mounted() {
    await this.loadStats()
    this.initChart()
  },
  methods: {
    async loadStats() {
      try {
        const token = this.$store.getters['user/token']
        // eslint-disable-next-line no-console
        console.log({ token })

        const { data } = await sisgescAPI.get('/financial/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        // eslint-disable-next-line no-console
        console.log({ data })

        this.stats = {
          received: data.received || 0,
          pending: data.pending || 0,
          total: data.total || 0
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading financial stats:', error)
      }
    },
    initChart() {
      const ctx = document.getElementById('paymentsChart')
      if (!ctx) {
        return
      }

      // this.chart = new Chart(ctx, {
      //   type: 'bar',
      //   data: {
      //     labels: [
      //       'Jan',
      //       'Fev',
      //       'Mar',
      //       'Abr',
      //       'Mai',
      //       'Jun',
      //       'Jul',
      //       'Ago',
      //       'Set',
      //       'Out',
      //       'Nov',
      //       'Dez'
      //     ],
      //     datasets: [
      //       {
      //         label: 'Recebidos',
      //         backgroundColor: '#4CAF50',
      //         data: [
      //           12000, 19000, 15000, 17000, 16000, 18000, 20000, 22000, 19000,
      //           21000, 23000, 25000
      //         ]
      //       },
      //       {
      //         label: 'Pendentes',
      //         backgroundColor: '#FFC107',
      //         data: [
      //           5000, 7000, 6000, 8000, 7000, 9000, 10000, 11000, 9000, 10000,
      //           12000, 13000
      //         ]
      //       }
      //     ]
      //   },
      //   options: {
      //     responsive: true,
      //     maintainAspectRatio: false,
      //     scales: {
      //       y: {
      //         beginAtZero: true,
      //         ticks: {
      //           callback: (value) => `R$ ${this.formatCurrency(value)}`
      //         }
      //       }
      //     }
      //   }
      // })
    },
    formatCurrency(value) {
      return value.toFixed(2).replace('.', ',')
    },
    navigateTo(path) {
      // this.$router.push({ name: route })
      this.$store.dispatch('route/openExtension', {
        path: path
      })
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  cursor: pointer;
}
</style>

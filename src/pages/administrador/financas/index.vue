<template lang="pug">
div
  qt-header(title="Gestão Financeira")
  v-container
    //- v-row
      //- v-col(cols="12")
      //-   h1.text-h4.mb-4 Gestão Financeira
    v-row
      v-col(cols="12" md="4")
        v-card.mb-4
          v-card-text
            v-row(align="center")
              v-col(cols="auto")
                v-icon.mr-4(color="success" size="48") mdi-cash-check
              v-col
                .text-h4 R$ {{ formatCurrency(stats.paid) }}
                .text-subtitle-1 Pagamentos Recebidos

      v-col(cols="12" md="4")
        v-card.mb-4
          v-card-text
            v-row(align="center")
              v-col(cols="auto")
                v-icon.mr-4(color="warning" size="48") mdi-cash-clock
              v-col
                .text-h4 R$ {{ formatCurrency(stats.pending) }}
                .text-subtitle-1 Pagamentos Pendentes

      v-col(cols="12" md="4")
        v-card.mb-4
          v-card-text
            v-row(align="center")
              v-col(cols="auto")
                v-icon.mr-4(color="error" size="48") mdi-cash-remove
              v-col
                .text-h4 R$ {{ formatCurrency(stats.overdue) }}
                .text-subtitle-1 Pagamentos Atrasados

    v-row
      v-col(cols="12")
        v-tabs(
          v-model="activeTab"
          background-color="primary"
          dark
        )
          v-tab(value="overdue") Atrasados
          v-tab(value="pending") Em Aberto
          v-tab(value="paid") Pagos

    v-row
      v-col(cols="12")
        v-card
          v-card-text
            v-data-table(
              :headers="headers"
              :items="filteredPayments"
              sort-by="dueDate"
              :items-per-page="10"
              :search="search"
              :sort-desc="true"
              :loading="loading"
            )
              template(v-slot:top)
                v-row
                  v-col(cols="12" sm="6")
                    v-text-field.mb-4(
                      v-model="search"
                      label="Buscar"
                      single-line
                      hide-details
                      prepend-icon="mdi-magnify"
                    )
                  v-col.d-flex.justify-end.align-center(cols="12" sm="6")
                    v-btn.mb-4(color="primary" @click="exportToExcel")
                      v-icon(left) mdi-file-excel
                      | Exportar

              template(v-slot:item.status="{ item }")
                v-chip(:color="getStatusColor(item.status)" small) {{ getStatusText(item.status) }}

              template(v-slot:item.amount="{ item }")
                | R$ {{ formatCurrency(item.amount) }}

              template(v-slot:item.dueDate="{ item }")
                | {{ formatDate(item.dueDate) }}

              template(v-slot:item.paymentDate="{ item }")
                | {{ item.paymentDate ? formatDate(item.paymentDate) : '-' }}

              template(v-slot:item.actions="{ item }")
                v-btn(
                  v-if="item.status === 'overdue'"
                  color="primary"
                  icon
                  small
                  :loading="item.sendingReminder"
                  @click="sendReminder(item)"
                )
                  v-icon mdi-email-send
                v-btn(
                  color="info"
                  icon
                  small
                  @click="viewDetails(item)"
                )
                  v-icon mdi-eye

              template(v-slot:no-data)
                .text-center.py-4
                  | Nenhum pagamento encontrado

    v-dialog(v-model="detailsDialog" max-width="700px")
      v-card
        v-card-title
          v-row(align="center")
            v-col
              span.text-h5 Detalhes do Pagamento
            v-col(cols="auto")
              v-btn(icon @click="detailsDialog = false")
                v-icon mdi-close

        v-card-text
          v-row
            v-col(cols="12" sm="6")
              .text-subtitle-1 Aluno
              .text-body-1 {{ selectedPayment?.studentName }}
            v-col(cols="12" sm="6")
              .text-subtitle-1 Responsável
              .text-body-1 {{ selectedPayment?.parentName }}
            v-col(cols="12" sm="6")
              .text-subtitle-1 Valor
              .text-body-1 R$ {{ formatCurrency(selectedPayment?.amount) }}
            v-col(cols="12" sm="6")
              .text-subtitle-1 Status
              .text-body-1
                v-chip(:color="getStatusColor(selectedPayment?.status)" small) {{ getStatusText(selectedPayment?.status) }}
            v-col(cols="12" sm="6")
              .text-subtitle-1 Vencimento
              .text-body-1 {{ formatDate(selectedPayment?.dueDate) }}
            v-col(cols="12" sm="6")
              .text-subtitle-1 Pagamento
              .text-body-1 {{ selectedPayment?.paymentDate ? formatDate(selectedPayment?.paymentDate) : '-' }}
            v-col(cols="12")
              .text-subtitle-1 Descrição
              .text-body-1 {{ selectedPayment?.description }}

        v-card-actions
          v-spacer
          v-btn(
            color="primary"
            text
            @click="detailsDialog = false"
          ) Fechar
</template>

<script>
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { sisgescAPI } from '@/api/index'

export default {
  name: 'FinancasPage',
  data() {
    return {
      activeTab: 'overdue',
      search: '',
      loading: false,
      detailsDialog: false,
      selectedPayment: null,
      stats: {
        paid: 0,
        pending: 0,
        overdue: 0
      },
      headers: [
        { text: 'Aluno', value: 'studentName' },
        { text: 'Responsável', value: 'parentName' },
        { text: 'Valor', value: 'amount' },
        { text: 'Vencimento', value: 'dueDate' },
        { text: 'Pagamento', value: 'paymentDate' },
        { text: 'Status', value: 'status' },
        { text: 'Ações', value: 'actions', sortable: false }
      ],
      payments: []
    }
  },
  computed: {
    filteredPayments() {
      return this.payments.filter((payment) => {
        if (this.activeTab === 'overdue') {
          return payment.status === 'overdue'
        } else if (this.activeTab === 'pending') {
          return payment.status === 'pending'
        } else if (this.activeTab === 'paid') {
          return payment.status === 'paid'
        }
        return true
      })
    }
  },
  async created() {
    await this.loadPayments()
  },
  methods: {
    async loadPayments() {
      this.loading = true
      try {
        // TODO: Replace with actual API call when endpoint is ready
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Fake payment data
        const fakePayments = [
          {
            uuid: '1',
            studentName: 'João Silva',
            parentName: 'Maria Silva',
            amount: 500.0,
            dueDate: '2024-03-10',
            paymentDate: null,
            description: 'Mensalidade Março 2024',
            isPaid: false
          },
          {
            uuid: '2',
            studentName: 'Ana Santos',
            parentName: 'Carlos Santos',
            amount: 500.0,
            dueDate: '2024-02-10',
            paymentDate: '2024-02-08',
            description: 'Mensalidade Fevereiro 2024',
            isPaid: true
          },
          {
            uuid: '3',
            studentName: 'Pedro Oliveira',
            parentName: 'Sandra Oliveira',
            amount: 500.0,
            dueDate: '2024-01-10',
            paymentDate: null,
            description: 'Mensalidade Janeiro 2024',
            isPaid: false
          },
          {
            uuid: '4',
            studentName: 'Mariana Costa',
            parentName: 'Roberto Costa',
            amount: 500.0,
            dueDate: '2024-03-15',
            paymentDate: null,
            description: 'Mensalidade Março 2024',
            isPaid: false
          },
          {
            uuid: '5',
            studentName: 'Lucas Ferreira',
            parentName: 'Patricia Ferreira',
            amount: 500.0,
            dueDate: '2024-02-15',
            paymentDate: '2024-02-14',
            description: 'Mensalidade Fevereiro 2024',
            isPaid: true
          }
        ]

        this.payments = fakePayments.map((payment) => ({
          id: payment.uuid,
          studentName: payment.studentName,
          parentName: payment.parentName,
          amount: payment.amount,
          dueDate: payment.dueDate,
          paymentDate: payment.paymentDate,
          description: payment.description,
          status: this.getPaymentStatus(payment),
          sendingReminder: false
        }))

        this.calculateStats()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading payments:', error)
      } finally {
        this.loading = false
      }
    },
    calculateStats() {
      this.stats = {
        paid: this.payments
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0),
        pending: this.payments
          .filter((p) => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0),
        overdue: this.payments
          .filter((p) => p.status === 'overdue')
          .reduce((sum, p) => sum + p.amount, 0)
      }
    },
    getPaymentStatus(payment) {
      if (payment.isPaid) {
        return 'paid'
      } else if (new Date(payment.dueDate) < new Date()) {
        return 'overdue'
      } else {
        return 'pending'
      }
    },
    getStatusColor(status) {
      const colors = {
        paid: 'success',
        pending: 'warning',
        overdue: 'error'
      }
      return colors[status] || 'grey'
    },
    getStatusText(status) {
      const texts = {
        paid: 'Pago',
        pending: 'Em Aberto',
        overdue: 'Atrasado'
      }
      return texts[status] || status
    },
    formatDate(date) {
      if (!date) {
        return '-'
      }
      return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
    },
    formatCurrency(value) {
      return value // .toFixed(2).replace('.', ',')
    },
    viewDetails(payment) {
      this.selectedPayment = payment
      this.detailsDialog = true
    },
    async sendReminder(payment) {
      try {
        this.$set(payment, 'sendingReminder', true)

        const token = this.$store.getters['user/token']

        await sisgescAPI.post(
          `/payments/${payment.id}/reminder`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        this.$store.dispatch('snackbar/show', {
          color: 'success',
          text: 'Lembrete enviado com sucesso!'
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error sending reminder:', error)

        this.$store.dispatch('snackbar/show', {
          color: 'error',
          text: 'Erro ao enviar lembrete. Tente novamente.'
        })
      } finally {
        this.$set(payment, 'sendingReminder', false)
      }
    },
    exportToExcel() {
      // TODO: Implement Excel export
      this.$store.dispatch(
        'snackbar/info',
        'Exportação para Excel em desenvolvimento'
      )
    }
  }
}
</script>

<style scoped>
.v-data-table {
  width: 100%;
}
</style>

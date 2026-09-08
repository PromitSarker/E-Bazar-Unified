/**
 * SSLCommerz payment gateway wrapper.
 * Docs: https://developer.sslcommerz.com/doc/v4/
 */

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID!
const STORE_PASSWD = process.env.SSLCOMMERZ_STORE_PASSWD!
const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === 'true'

const BASE_URL = IS_LIVE
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com'

export interface SSLCommerzInitPayload {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  productName: string
}

export interface SSLCommerzInitResponse {
  status: string
  gatewayPageURL?: string
  sessionkey?: string
  GatewayPageURL?: string
  redirectGatewayURL?: string
  failedreason?: string
}

export async function initSSLCommerzPayment(
  data: SSLCommerzInitPayload
): Promise<SSLCommerzInitResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const params = new URLSearchParams({
    store_id: STORE_ID,
    store_passwd: STORE_PASSWD,
    total_amount: data.amount.toFixed(2),
    currency: 'BDT',
    tran_id: data.orderId,
    success_url: `${baseUrl}/api/payment/success`,
    fail_url: `${baseUrl}/api/payment/fail`,
    cancel_url: `${baseUrl}/api/payment/cancel`,
    ipn_url: `${baseUrl}/api/payment/ipn`,
    cus_name: data.customerName,
    cus_email: data.customerEmail,
    cus_phone: data.customerPhone,
    cus_add1: data.customerAddress,
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    num_of_item: '1',
    product_name: data.productName,
    product_category: 'Grocery',
    product_profile: 'general',
  })

  const response = await fetch(`${BASE_URL}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  return response.json()
}

export async function validateSSLCommerzPayment(params: Record<string, string>): Promise<boolean> {
  const valId = params.val_id
  if (!valId) return false

  const url = `${BASE_URL}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWD}&format=json`

  const response = await fetch(url)
  const data = await response.json()

  return (
    data.status === 'VALID' || data.status === 'VALIDATED'
  )
}

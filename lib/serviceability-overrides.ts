export const TEST_SERVICEABLE_PINCODES = new Set(['415001'])

export function isTestServiceablePincode(pincode: string) {
  return TEST_SERVICEABLE_PINCODES.has(pincode.trim())
}

export function getTestServiceabilityResponse(deliveryPincode: string, codFlag: 0 | 1) {
  return {
    data: {
      available_courier_companies: [
        {
          courier_company_id: 0,
          courier_name: 'Testing Courier',
          delivery_postcode: deliveryPincode,
          cod: codFlag,
        },
      ],
    },
  }
}

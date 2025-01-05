import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Modals from '../Modal.vue'

describe('Modals Props', () => {
  it('renders properly', () => {
    const wrapper = mount(Modals, { props: { openModal: false, onSubmit: () => {} } })
    expect(Object.keys(wrapper.props()).length).toEqual(3)
  })
})

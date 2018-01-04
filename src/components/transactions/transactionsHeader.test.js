import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import tableStyle from 'react-toolbox/lib/table/theme.css';
import PropTypes from 'prop-types';
import i18n from '../../i18n';
import TransactionsHeader from './transactionsHeader';

describe('TransactionsHeader', () => {
  it('should have 3 header columns', () => {
    const wrapper = mount(<TransactionsHeader tableStyle={tableStyle}></TransactionsHeader>,
      {
        context: { i18n },
        childContextTypes: {
          i18n: PropTypes.object.isRequired,
        },
      });

    const expectedValue = /header/g;
    const html = wrapper.find('#transactionsHeader').html();
    expect(html.match(expectedValue)).to.have.lengthOf(3);
  });
});

import React from 'react';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import Dropdown from 'react-toolbox/lib/dropdown';
import i18next from 'i18next';
import { FontIcon } from '../fontIcon';
import Input from '../toolbox/inputs/input';
import { PrimaryButton } from '../toolbox/buttons/button';
import { extractAddress } from '../../utils/api/account';
// eslint-disable-next-line import/no-named-as-default
import PassphraseInput from '../passphraseInput';
import styles from './login.css';
import networks from '../../constants/networks';
import routes from '../../constants/routes';
import getNetwork from '../../utils/getNetwork';
import { parseSearchParams } from './../../utils/searchParams';
import Box from '../box';
// eslint-disable-next-line import/no-unresolved
import SignUp from './signUp';
import { validateUrl } from '../../utils/login';

/**
 * The container component containing login
 * and create account functionality
 */
class Login extends React.Component {
  constructor() {
    super();

    this.state = {
      passphrase: '',
      address: '',
      network: networks.default.code,
    };

    this.validators = {
      address: validateUrl,
      passphrase: this.validatePassphrase.bind(this),
    };
  }

  componentWillMount() {
    this.getNetworksList();
    i18next.on('languageChanged', () => {
      this.getNetworksList();
    });
  }

  getNetworksList() {
    this.networks = Object.keys(networks)
      .filter(network => network !== 'default')
      .map((network, index) => ({
        label: i18next.t(networks[network].name),
        value: index,
      }));
  }

  componentDidUpdate(prevProps) {
    if (this.props.account &&
      this.props.account.address &&
      !this.alreadyLoggedWithThisAddress(prevProps.account.address, prevProps.peers.options)) {
      this.redirectToReferrer();
    }
  }

  redirectToReferrer() {
    const tem = this.getReferrerRoute();
    this.props.history.replace(tem);
  }

  alreadyLoggedWithThisAddress(address, network) {
    return this.props.account &&
      this.props.peers.options &&
      this.props.account.address === address &&
      this.props.peers.options.code === network.code &&
      this.props.peers.options.address === network.address;
  }

  getNetwork() {
    const network = Object.assign({}, getNetwork(this.state.network));
    if (this.state.network === networks.customNode.code) {
      network.address = this.state.address;
    }
    return network;
  }

  onLoginSubmission(passphrase) {
    const network = this.getNetwork();
    if (this.alreadyLoggedWithThisAddress(extractAddress(passphrase), network)) {
      this.redirectToReferrer();
      this.props.activeAccountSaved();
    } else {
      this.props.activePeerSet({
        passphrase,
        network,
      });
    }
  }

  getReferrerRoute() {
    const search = parseSearchParams(this.props.history.location.search);
    const dashboardRoute = `${routes.main.path}${routes.dashboard.path}`;
    const referrerRoute = search.referrer ? search.referrer : dashboardRoute;
    return referrerRoute;
  }

  // eslint-disable-next-line class-methods-use-this
  validatePassphrase(value, error) {
    const data = { passphrase: value };
    data.passphraseValidity = error || '';
    return data;
  }

  changeHandler(name, value, error) {
    const validator = this.validators[name] || (() => ({}));
    this.setState({
      [name]: value,
      ...validator(value, error),
    });
  }

  onFormSubmit(event) {
    event.preventDefault();
    this.onLoginSubmission(this.state.passphrase);
  }

  passFocused() {
    this.setState({
      passInputState: 'focused',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showNetworkOptions() {
    const params = parseSearchParams(this.props.history.location.search);
    const showNetwork = localStorage.getItem('showNetwork');
    return params.showNetwork === 'true' || (showNetwork && params.showNetwork !== 'false');
  }

  render() {
    return (this.props.account.loading ?
      <span></span> :
      <Box className={styles.wrapper}>
        <section className={`${styles.login} ${styles[this.state.passInputState]}`}>
          <section className={styles.table}>
            <header>
              <a className={styles.backButton} href='https://lisk.io' target='_blank' rel='noopener noreferrer'>
                <FontIcon className={styles.icon}>arrow-left</FontIcon>
                <span className={styles.label}>{this.props.t('Back to lisk.io')}</span>
              </a>
            </header>
            <div className={`${styles.tableCell} text-left`}>
              <h2>{this.props.t('Sign in')}</h2>
              <form onSubmit={this.onFormSubmit.bind(this)}>
                {this.showNetworkOptions()
                  ? <div className={styles.outTaken}>
                    <Dropdown
                      auto={false}
                      source={this.networks}
                      onChange={this.changeHandler.bind(this, 'network')}
                      label={this.props.t('Select a network')}
                      value={this.state.network}
                      className='network'
                    />
                    {
                      this.state.network === networks.customNode.code &&
                      <Input type='text'
                        label={this.props.t('Node address')}
                        name='address'
                        className={`address ${styles.outTaken}`}
                        theme={styles}
                        value={this.state.address}
                        error={this.state.addressValidity}
                        onChange={this.changeHandler.bind(this, 'address')}/>
                    }
                  </div>
                  : ''
                }
                <PassphraseInput label={this.props.t('Enter your passphrase')}
                  className='passphrase'
                  onFocus={this.passFocused.bind(this)}
                  theme={styles}
                  error={this.state.passphraseValidity}
                  value={this.state.passphrase}
                  onChange={this.changeHandler.bind(this, 'passphrase')} />
                <footer className={ `${grid.row} ${grid['center-xs']}` }>
                  <div className={grid['col-xs-12']}>
                    <PrimaryButton label={this.props.t('Log in')}
                      className='login-button'
                      type='submit'
                      disabled={(this.state.network === networks.customNode.code && this.state.addressValidity !== '') ||
                      this.state.passphraseValidity !== '' || this.state.passphrase === ''} />
                  </div>
                </footer>
              </form>
            </div>
          </section>
        </section>
        <SignUp t={this.props.t} passInputState={this.state.passInputState} />
      </Box>
    );
  }
}

export default Login;

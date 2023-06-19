import { Tab } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import Dropdown from '../common/Dropdown';
import ActivitiesTab from './Tabs/Activity';
import BagTab from './Tabs/Bags';

import { copyToClipboard, truncateString } from '../../../../lib/helpers';
import useRegisterWallet from '../../hooks/registrations/useRegisterWallet';
import useIsWalletLoaded from '../../hooks/wallet/useIsWalletLoaded';
import BusinessInfo from './AddedDetails/BusinessInfo';
import SocialProfiles from './AddedDetails/SocialInfo';
import WalletAddresses from './AddedDetails/WalletAddresses';
interface ActiveWalletProps {
  walletAddress: string | null;
  walletBalance: number | null;
  twitterHandle: string;
  twitterProfileImage?: string;
}

const ActiveWallet: React.FC<ActiveWalletProps> = ({
  walletAddress,
  twitterHandle,
  walletBalance,
  twitterProfileImage,
}) => {
  const options = ['Wallet Addresses', 'Business Info', 'Social Profiles'];
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [
    gettingWalletStatusFromRegistering,
    setGettingWalletStatusFromRegistering,
  ] = useState(false);
  const [walletStatusFromRegistering, setWalletStatusFromRegistering] =
    useState(false);
  const [walletErrorFromRegistering, setWalletErrorFromRegistering] =
    useState(false);
  const { handleRegisterWalletInBackend } = useRegisterWallet();
  const {
    walletLoadedStatus,
    loadingResponseForCheckingWalletStatus,
    errorCheckingWalletStatus,
  } = useIsWalletLoaded(walletAddress ? walletAddress : '');

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  const onBack = () => {
    setSelectedOption('');
  };

  const renderDropdownElement = () => {
    switch (selectedOption) {
      case 'Wallet Addresses':
        return (
          <WalletAddresses walletAddress={'test'} onBack={onBack} network="" />
        );
      case 'Business Info':
        return (
          <BusinessInfo businessAddress="" businessName="" onBack={onBack} />
        );
      case 'Social Profiles':
        return (
          <SocialProfiles
            onBack={onBack}
            lensProfile=""
            blueskyProfile=""
            farcasterProfile="s"
          />
        );
      default:
        return null;
    }
  };

  const tokens = [
    {
      name: 'Ethereum',
      symbol: 'Eth',
      value: 1800,
      amount: 1,
      performance: 10,
      image:
        'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880',
    },
  ];

  const handleRegisterWalletClick = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (walletAddress && !walletLoadedStatus) {
      try {
        setGettingWalletStatusFromRegistering(true);
        const responseFromRegisteringWallet =
          await handleRegisterWalletInBackend(walletAddress);
        setGettingWalletStatusFromRegistering(false);

        if (responseFromRegisteringWallet) {
          if (responseFromRegisteringWallet.is_loaded) {
            setWalletStatusFromRegistering(true);
          } else if (responseFromRegisteringWallet.error) {
            setGettingWalletStatusFromRegistering(false);

            setWalletErrorFromRegistering(true);
          }
        }
      } catch (e) {
        setGettingWalletStatusFromRegistering(false);

        console.error('error trying to register a wallet');
      }
    }
  };

  // add in check to look up registered wallet status
  return (
    <div className="flex flex-col w-full space-y-4 px-4">
      <div className="flex flex-row items-start justify-between w-full mt-2 mb-4">
        <div className="flex flex-row items-center w-full gap-x-2 ">
          {twitterProfileImage && twitterProfileImage.length ? (
            <img
              src={twitterProfileImage}
              className="w-6 h-6 rounded-full"
              alt={`twitter profile for ${twitterHandle}`}
            />
          ) : (
            <div className="w-6 h-6 bg-gray-500 rounded-full" />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-gray-900 tracking-tight">
              {twitterHandle}
            </span>
            <div className="flex flex-row items-center gap-x-2">
              <span className="font-light text-xs text-gray-600 tracking-wide">
                {walletAddress ? truncateString(walletAddress, 4, 4) : '0x'}
              </span>
              {walletAddress ? (
                <button
                  onClick={() => copyToClipboard(walletAddress)}
                  className="font-light text-xs text-indigo-600 tracking-wide"
                >
                  Copy{' '}
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-5 items-start">
          {loadingResponseForCheckingWalletStatus ? (
            <div className="animate-pulse text-sm font-thin text-gray-500">
              Checking wallet status
            </div>
          ) : walletLoadedStatus || walletStatusFromRegistering ? (
            <p className="text-sm text-indigo-500 font-semibold">
              Registered ✔
            </p>
          ) : gettingWalletStatusFromRegistering ? (
            <div className="animate-pulse text-sm font-thin text-gray-500">
              Registering wallet
            </div>
          ) : errorCheckingWalletStatus || walletErrorFromRegistering ? (
            <div className=" text-sm font-thin text-red-500">
              Error Registering wallet
            </div>
          ) : (
            <button
              onClick={handleRegisterWalletClick}
              className={`py-2 px-3 rounded-xl whitespace-nowrap font-semibold border-b border-b-gray-200 bg-indigo-200 font-semibold text-sm tracking-wide 
                         'text-gray-900'
                      `}
            >
              Register Wallet
            </button>
          )}

          <Dropdown options={options} onChange={handleSelect} />
        </div>
      </div>

      {selectedOption && selectedOption.length > 0 ? (
        <>{renderDropdownElement()}</>
      ) : (
        <Tab.Group>
          <Tab.List className="flex p-2 space-x-2 bg-white border-b border-b-gray-200 pb-4 justify-around w-full rounded-b-none rounded-md mb-4">
            {['Bag', 'Activities'].map((el) => (
              <>
                <Tab as={Fragment} key={el}>
                  {({ selected }) => (
                    <button
                      className={`py-2 px-3 rounded-xl font-semibold text-sm tracking-wide ${
                        selected ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`}
                    >
                      {el}
                    </button>
                  )}
                </Tab>
              </>
            ))}
          </Tab.List>
          <Tab.Panels>
            <BagTab
              tokens={tokens}
              walletAddress={walletAddress ? walletAddress : ''}
              walletIsRegistered={
                walletLoadedStatus || walletStatusFromRegistering
              }
              walletBalance={walletBalance ? walletBalance : 0}
              walletPerformance={100}
            />

            <ActivitiesTab />
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
};

export default ActiveWallet;

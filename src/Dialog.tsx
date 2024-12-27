import React, { useState, useLayoutEffect, useMemo, useEffect } from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';

interface DialogContent {
  title: string;
  description: string;
  subTitle: string;
  subDescription: string;
  tokenDetails: {
    totalSupply: string;
    ticker: string;
    price: string;
    totalDeposit: string;
    totalAllocation: string;
  };
  imagePath: string;
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: number | null;
  clickPosition?: { x: number, y: number };
}

interface DialogContentProps {
  isLeftSide: boolean;
  content: DialogContent;
}

// Default content configuration
const defaultContent: DialogContent = {
  title: "Grafi Essential",
  description: "More than an 'AI gadget' Grafi Essential empowers your daily activities. It connects you instantly to the latest GPTs through a vast DePIN network that trains your AI companion while unlocking data monetization opportunities in the emerging data economy.",
  subTitle: "Grafi AI App Store",
  subDescription: "Gateway for all premium AI app through Telegram",
  tokenDetails: {
    totalSupply: "TBA",
    ticker: "$GRAFI",
    price: "TBA",
    totalDeposit: "TBA",
    totalAllocation: "TBA"
  },
  imagePath: "assets/coin1.png"
};

const CountdownTimer = () => {
  const [time, setTime] = useState({
    hours: 12,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => {
        let newHours = prevTime.hours;
        let newMinutes = prevTime.minutes;
        let newSeconds = prevTime.seconds;

        // Decrease seconds
        newSeconds--;

        // Handle minute rollover
        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes--;
        }

        // Handle hour rollover
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours--;
        }

        // Reset timer after 10 seconds have passed from start
        const totalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds;
        const initialSeconds = 12 * 3600; // 12 hours in seconds
        if (initialSeconds - totalSeconds >= 10) {
          return {
            hours: 12,
            minutes: 0,
            seconds: 0
          };
        }

        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  return (
    <div className="relative group p-6">
      {/* Wider rainbow glow effect */}
      <div className="absolute -inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[2rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
      
      {/* Main content */}
      <div className="relative rounded-3xl p-4 bg-gradient-to-r from-gray-900 via-gray-950 to-black">
        <p className="text-gray-400 text-sm mb-4 flex justify-center">Starts in</p>
        <div className="text-5xl font-bold text-white flex justify-center gap-2">
          <span>{formatNumber(time.hours)}</span>
          <span>:</span>
          <span>{formatNumber(time.minutes)}</span>
          <span>:</span>
          <span>{formatNumber(time.seconds)}</span>
        </div>
      </div>
    </div>
  );
};

// Separate the content into a memoized component
const DialogContent = React.memo(({ isLeftSide, content }: DialogContentProps) => {
  const TokenSection = () => (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-xl p-4 backdrop-blur-sm border border-purple-400 shadow-[0_0_15px_5px_rgba(147,51,234,0.3)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <img src={content.imagePath} alt="Token Logo" className="w-32 h-auto" />
          </div>
          <div>
            <HeadlessDialog.Title className="text-lg font-bold">
              Token Details
            </HeadlessDialog.Title>
            <div className="space-y-4 mt-1 text-sm">
              <div>
                <p className="text-white-300">Total Supply:</p>
                <p className="text-white">{content.tokenDetails.totalSupply}</p>
              </div>
              <div>
                <p className="text-white-300">Ticker:</p>
                <p className="text-white">{content.tokenDetails.ticker}</p>
              </div>
              <div>
                <p className="text-white-300">Initial Price Per Token:</p>
                <p className="text-white">{content.tokenDetails.price}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-6 bg-white-700 rounded-xl overflow-hidden border-2 border-purple-400">
        <div className="h-full w-1/2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl" />
      </div>
      <div className="flex justify-between text-sm">
        <div className="flex-1">
          <p className="text-white-400">Total Deposit</p>
          <p className="text-white">{content.tokenDetails.totalDeposit}</p>
        </div>
        <div className="flex-1 text-right">
          <p className="text-white-400">Total Allocation</p>
          <p className="text-white">{content.tokenDetails.totalAllocation}</p>
        </div>
      </div>

      <CountdownTimer />
    </div>
  );

  const DescriptionSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-purple-400">{content.title}</h3>
        <p className="text-sm text-white-400 mt-2">
          {content.description}
        </p>
      </div>
      
      <div>
        <img src="assets/Group (3).png" alt="Grafi Icon" className="w-6 h-6 mb-2" />
        <h3 className="text-lg font-semibold text-purple-400">{content.subTitle}</h3>
        <p className="text-sm text-white-400 mt-2">
          {content.subDescription}
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      {isLeftSide ? (
        <>
          <DescriptionSection />
          <TokenSection />
        </>
      ) : (
        <>
          <TokenSection />
          <DescriptionSection />
        </>
      )}
    </div>
  );
});

DialogContent.displayName = 'DialogContent';

// Create a mapping of content for different dialog items
const dialogContentMap: { [key: number]: DialogContent } = {
  1: {
    ...defaultContent,
    title: "Feature 1",
    description: "Description for Feature 1",
  },
  2: {
    ...defaultContent,
    title: "Feature 2",
    description: "Description for Feature 2",
  },
  3: {
    ...defaultContent,
    title: "Feature 3",
    description: "Description for Feature 3",
  },
  4: {
    ...defaultContent,
    title: "Feature 4",
    description: "Description for Feature 4",
  },
  5: {
    ...defaultContent,
    title: "Feature 5",
    description: "Description for Feature 5",
  },
  6: {
    ...defaultContent,
    title: "Feature 5",
    description: "Description for radio feature",
  },
};

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, selectedItem, clickPosition }) => {
  const isLeftSide = useMemo(() => {
    if (!clickPosition) return false;
    return clickPosition.x < window.innerWidth / 2;
  }, [clickPosition]);

  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (isOpen) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [isOpen]);

  if (!isReady || !selectedItem) return null;

  const content = dialogContentMap[selectedItem] || defaultContent;

  return (
    <HeadlessDialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="bg-gray-900/95 text-white rounded-xl p-6 w-full max-w-[800px] backdrop-blur-xl shadow-[0_0_15px_5px_rgba(147,51,234,0.3)] relative">
          <DialogContent isLeftSide={isLeftSide} content={content} />
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
};

export default Dialog;
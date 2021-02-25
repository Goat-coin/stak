import React from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Tooltip } from '@material-ui/core';
import { Help as TipIcon } from '@material-ui/icons';
import { formatUnits, toFixed, isZero, Big } from '../utils/big-number';
import Paper from '../components/Paper';
import { useWallet } from '../contexts/wallet';
import { useStats } from '../contexts/stats';
import { useNotifications } from '../contexts/notifications';
import { Button } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: 14,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    columnGap: '10px',
  },
  box: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    padding: 20,
    background: theme.palette.isDark ? '#555' : '#fff',
    color: theme.palette.isDark ? 'white' : '#373836',
    position: 'relative',
  },
  boxTip: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  boxTitle: {
    fontSize: 11,
  },
  small: {
    fontSize: 10,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
}));


export default function() {
  const classes = useStyles();
  const { goatDecimals, wrappedBNBDecimals, stakingContract, address, lpContract } = useWallet();
  const {
    apy,
    availableGoatRewards,
    rewardMultiplier,
    bnbPonusPoolSharePercentage,
    bnbPonusPoolShareAmount,
    stakingEndSec,
    rewardPerToken,
    getRewardForDuration
  } = useStats();
  
  const getApr = async () => {
    try {
      const rewardRate = await stakingContract.rewardRate;
      const totalSupply = await stakingContract.totalSupply();
      console.log("hello");
      return "hello world";
    } catch (e) {
      console.log("hello");
      // useNotifications.showErrorNotification(e);
    }
  };
  
  const getReward = async () => {
    // if (!(lpContract && address)) return;
    try {
      
      // if (depositAmount.isZero())
      //   return showErrorNotification('Enter deposit amount.');
      // if (!depositMaxAmount && depositAmount.gt(maxDepositAmount)) {
      //   return showErrorNotification(
      //     'You are trying to deposit more than your actual balance.'
      //   );
      // }
      // setIsDepositing(true);
      const tx = await stakingContract.getReward();
      // showTxNotification(`Depositing ${lpName}`, tx.hash);
      await tx.wait();
      // showTxNotification(`Deposited ${lpName}`, tx.hash);
      // onSetDepositMaxAmount();
    } catch (e) {
      // useNotifications.showErrorNotification(e);
    }
  };

  const stats = React.useMemo(
    () => [
      {
        name: 'Rewards Earned',
        value: [
          <div className="flex items-start flex-wrap">
            <div className="flex items-end">
              {formatUnits(availableGoatRewards, goatDecimals)} GOAT
              <Box ml={1}>
                <img src="coins/GOAT.png" alt="GOAT" width={15} height={15} />
              </Box>
            </div>

              <Button
                  color="default"
                  variant="outlined"
                  onClick={getReward}
                  className="full-width mt-8"
                  // disabled={!(lpContract && address)}
              >
                Claim Rewards
              </Button>
              
          </div>
        ],
        tip:
          '',
      },
      {
        name: 'Reward per 1 LP token for 50 days',
        value: [
          <div>
            {formatUnits(rewardPerToken, 20)} Goat
          </div>,
          <div>
            <div className="text-sm">Remaining Tokens</div>
            <div>{formatUnits(getRewardForDuration, goatDecimals, 13)}</div>
          </div>,
        ],
        tip: '',
      },
    ],
    [
      apy,
      availableGoatRewards,
      goatDecimals,
      wrappedBNBDecimals,
      rewardMultiplier,
      bnbPonusPoolShareAmount,
      bnbPonusPoolSharePercentage,
      stakingEndSec,
      classes.small,
      classes.link,
    ]
  );

  return (
    <Box className={clsx(classes.container)}>
      {stats.map(s => (
        <StatBox key={s.name} {...s} />
      ))}
    </Box>
  );
}

function StatBox({ name, value, tip }) {
  const classes = useStyles();

  return (
    <Paper className={clsx(classes.box)}>
      <Tooltip title={tip}>
        <TipIcon style={{ fontSize: 15 }} className={classes.boxTip} />
      </Tooltip>
      <div className={clsx(classes.boxTitle)}>{name}</div>
      <div>
        {value.map((v, i) => (
          <div key={i}>{v}</div>
        ))}
      </div>
    </Paper>
  );
}

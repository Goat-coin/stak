import React from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Tooltip } from '@material-ui/core';
import { Help as TipIcon } from '@material-ui/icons';
import { formatUnits, toFixed, isZero } from '../utils/big-number';
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
  const { goatDecimals, wrappedBNBDecimals } = useWallet();
  const {
    apy,
    availableGoatRewards,
    rewardMultiplier,
    bnbPonusPoolSharePercentage,
    bnbPonusPoolShareAmount,
    stakingEndSec,
    lpContract,
    address,
    stakingContract,
    showTxNotification,
    lpName,
    onSetDepositMaxAmount,
    showErrorNotification
  } = useStats();

  const stats = React.useMemo(
    () => [
      {
        name: 'APR',
        value: [`${toFixed(apy, 1, 2)}%`],
        tip: 'APR is estimated for a new deposit over the next 30 days.',
      },
      {
        name: 'Rewards Earned',
        value: [
          <div className="flex items-start flex-wrap">
            {formatUnits(checkClaimableRewards(), goatDecimals)} GOAT
            <Box ml={1} className="flex items-center">
              <img src="coins/GOAT.png" alt="GOAT" width={15} height={15} />
            </Box>

              <Button
                  color="default"
                  variant="outlined"
                  onClick={getReward}
                  // disabled={!(lpContract && address)}
              >
                Claim Rewards
              </Button>
              
          </div>
        ],
        tip:
          'Amount of GOAT rewards you will receive on unstaking.',
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

const checkClaimableRewards = async () => {
  if (!(stakingContract && address)) return;
  const [
    // availableCakeRewards,
    totalStakedFor,
    // [, , userStakingShareSeconds, totalStakingShareSeconds, totalUserRewards],
  ] = await Promise.all([
    // stakingContract.pendingCakeByUser(address),
    stakingContract.earned(address)
    // stakingContract.callStatic.updateAccounting(),
  ]);
  const availableGoatRewards = totalStakedFor.isZero()
    ? '0'
    : await stakingContract.callStatic.unstakeQuery(totalStakedFor);
  // setAvailableCakeRewards(Big(availableCakeRewards));

  return (Big(availableGoatRewards));

};

const getReward = async () => {
  // if (!(lpContract && address)) return;
  try {

    const tx = await stakingContract.getReward();
    // showTxNotification(`Depositing ${lpName}`, tx.hash);
    await tx.wait();
    // showTxNotification(`Deposited ${lpName}`, tx.hash);
    // onSetDepositMaxAmount();
  } catch (e) {
    useNotifications.showErrorNotification(e);
  } 
};

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

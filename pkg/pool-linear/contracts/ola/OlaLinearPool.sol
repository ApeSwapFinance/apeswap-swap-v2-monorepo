// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../LinearPool.sol";

interface IOTokenForOlaLinearPool {
    function underlying() external view returns (address);

    function decimals() external view returns (uint256);

    function exchangeRateStored() external view returns (uint256);
}

/**
 * OlaLinearPoolFactory
 * Based on : https://etherscan.io/address/0x2BBf681cC4eb09218BEe85EA2a5d3D13Fa40fC0C#code
 */
contract OlaLinearPool is LinearPool {
    uint256 private immutable _exchangeRateScale;
    IOTokenForOlaLinearPool private _oToken;

    constructor(
        IVault vault,
        string memory name,
        string memory symbol,
        IERC20 mainToken,
        IERC20 wrappedToken,
        uint256 upperTarget,
        uint256 swapFeePercentage,
        uint256 pauseWindowDuration,
        uint256 bufferPeriodDuration,
        address owner
    )
        LinearPool(
            vault,
            name,
            symbol,
            mainToken,
            wrappedToken,
            upperTarget,
            swapFeePercentage,
            pauseWindowDuration,
            bufferPeriodDuration,
            owner
        )
    {
        IOTokenForOlaLinearPool oToken = IOTokenForOlaLinearPool(address(wrappedToken));
        // Sanity check -- Underlying must be the 'mainToken'
        address underlying = oToken.underlying();
        _require(underlying == address(mainToken), Errors.TOKENS_MISMATCH);

        uint256 oTokenDecimals = oToken.decimals();
        uint256 underlyingDecimals = ERC20(underlying).decimals();
        require((underlyingDecimals <= 18) && (oTokenDecimals <= 18), "Unsupported decimals");

        /**
         * @dev Standard oToken contracts: _exchangeRateScale = 10 + underlyingDecimals;
         *   oTokens generally have 8 decimals, so this exchange rate takes into consideration the
         *   scaling from underlying to oToken. (i.e. 18 decimals -> 8 decimals) This also accounts for
         *   oToken markets which may have different than 8 decimals in the future (unlikely).
         */
        _exchangeRateScale = 18 + underlyingDecimals - oTokenDecimals;
        _oToken = oToken;
    }

    function _getWrappedTokenRate() internal view override returns (uint256) {
        uint256 wantedScale = 18;

        // This function returns a 18 decimal fixed point number, but `rate` has [underlying.decimals + 10] decimals
        // so we need to convert it.
        uint256 exchangeRateStored = _oToken.exchangeRateStored();
        return (exchangeRateStored * (10**wantedScale)) / (10**_exchangeRateScale);
    }
}

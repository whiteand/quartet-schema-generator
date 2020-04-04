"use strict";
exports.__esModule = true;
var WebSocketChannel;
(function (WebSocketChannel) {
    WebSocketChannel["AppNotifications"] = "app-notifications";
    WebSocketChannel["ExecutionReport"] = "execution-report";
    WebSocketChannel["Instruments"] = "instruments";
    WebSocketChannel["NetworkFeeBitcoin"] = "bitcoin-network-fee";
    WebSocketChannel["MarketActivity"] = "market-activity";
    WebSocketChannel["OpenHighLowClose"] = "ohlc";
    WebSocketChannel["OpenPositions"] = "position-profile";
    WebSocketChannel["OptionChain"] = "option-chain";
    WebSocketChannel["OptionInstrumentStatistics"] = "option-instrument-statistics";
    WebSocketChannel["OptionsInstrumentMarketStatistic"] = "options-instrument-market-statistic";
    WebSocketChannel["OrderBooksL1"] = "order-books-L1";
    WebSocketChannel["OrderBooksL2"] = "order-books-L2";
    WebSocketChannel["SpotIndices"] = "spot-indices";
    WebSocketChannel["Trader"] = "trader";
    WebSocketChannel["Trades"] = "trades";
    WebSocketChannel["Watchlist"] = "watchlist";
})(WebSocketChannel || (WebSocketChannel = {}));
// validate: IOptionChainSubscribedMessage

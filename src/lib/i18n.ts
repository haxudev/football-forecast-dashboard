export type Locale = 'zh' | 'en';

const dictionaries = {
  zh: {
    nav: {
      overview: '总览',
      competitions: '赛事',
      matchPredictor: '单场研究',
      tournamentSimulator: '赛事模拟',
      teamComparison: '球队对比',
      modelDiagnostics: '模型诊断',
      dataQuality: '数据质量',
    },
    common: {
      systemHealthy: '系统正常',
      systemStale: '数据需关注',
      truth: '真实性',
      pack: '数据包',
      model: '模型',
      confidence: '置信度',
      freshness: '新鲜度',
      sampleOnly: 'SAMPLE_ONLY 示例数据',
      notBettingAdvice: '非投注建议',
      marketOddsNotUsed: '未使用市场赔率',
      dataResearchOnly: '仅供研究分析，不构成投注建议。',
      openCompetition: '查看赛事 →',
      viewDiagnostics: '查看诊断 →',
      generated: '生成时间',
      warnings: '警示',
      high: '高',
      med: '中',
      low: '低',
      light: '浅色',
      dark: '深色',
      language: '语言',
      theme: '主题',
      chinese: '中文',
      english: 'English',
      home: '主队',
      draw: '平局',
      away: '客队',
      probability: '概率',
      team: '球队',
      advance: '晋级',
      champion: '冠军',
      disabled: '已停用',
      ready: '就绪',
    },
    overview: {
      title: '预测研究总览',
      subtitle: '按赛事组织的静态预测看板；概率、真实性、置信度、模型健康和数据质量保持同屏可见。',
      metricsLabel: '五个核心研究状态指标',
      system: '系统',
      systemText: '静态导出 + 数据包已加载',
      truthText: '回退/示例状态保持琥珀提示',
      models: '模型',
      scopes: '个范围',
      lastPack: '最近数据包',
      sources: '数据源',
      sourceText: '新鲜',
      competitionFocus: '按赛事浏览',
      competitionFocusText: '从 2026 世界杯、英超、欧冠等赛事进入，查看概览、单场预测、模拟和数据状态。',
      topResearchCases: '重点研究场次',
      uncertaintyWatch: '不确定性与示例提示',
      limitedCoverage: '当前 SAMPLE_ONLY 数据包覆盖有限；不暗示生产级置信度。',
      featuredCompetitions: '推荐赛事入口',
      modelHealth: '模型健康',
      modelHealthText: '回测指标和校准信息可在模型诊断页查看。当前模型版本：',
      dataPackSnapshot: '数据包快照',
      fallbackNote: '回退/示例状态会以琥珀色显示，不被当作真实数据成功。',
    },
    competitions: {
      title: '赛事中心',
      subtitle: '以赛事为入口浏览预测研究。每个赛事页汇总赛制、数据状态、预测列表和模拟能力。',
      tournament: '杯赛/锦标赛',
      league: '联赛',
      snapshot: '赛事快照',
      fixtures: '赛程与预测',
      detailSubtitle: '赛程与预测 · Elo/Poisson/回退校准的 ensemble baseline。',
      snapshotPrefix: '赛制',
      scope: '范围',
      source: '来源',
      sampleBaseline: '当前数据包是 SAMPLE_ONLY 基线，不是实时生产预测产品。',
      simulatorAvailable: '包含赛事模拟',
      predictionsAvailable: '包含单场预测',
      dataState: '数据状态',
      researchNote: '研究说明',
    },
    match: {
      title: '单场预测研究',
      subtitle: '静态查询。无赔率输入。非投注建议。',
      selector: '研究选择器',
      competition: '赛事',
      season: '赛季',
      homeTeam: '主队',
      awayTeam: '客队',
      run: '运行静态查询',
      disabledState: '超过 72 小时已停用；展示最后一次静态数据。',
      readyState: '可查看。',
      sourceState: '置信度与来源状态',
      probabilityChart: '胜 / 平 / 负 概率',
      heatmap: '比分概率热力图',
      topDrivers: '主要描述因子',
      driverNote: '因子影响仅作描述，不表示因果关系。',
      xgExtras: '预期进球与补充说明',
      caveat: '提示：SAMPLE_ONLY 基线数据。该预测未使用市场赔率，未使用首发阵容。请按低置信度研究样例理解，非投注建议。',
      parseFailed: '预测数据包解析失败。静态构建中没有可展示的最后场次。',
    },
    tournament: {
      title: '赛事模拟',
      subtitle: '静态 Monte Carlo 基线。移动端使用轮次选择器。',
      advancement: '晋级概率',
      noSimulation: '此赛事没有可用模拟结果。这是静态数据包的明确停用状态。',
      limited: '数据有限：SAMPLE_ONLY，{count} 支球队。仅作基线淘汰路径证据，不代表生产覆盖。',
    },
    team: {
      title: '球队对比',
      subtitle: '来自静态数据包的归一化强度基线；不含实时阵容或赔率信号。',
      context: '静态示例上下文',
      radar: '强度雷达',
      recentForm: '近期状态时间线',
      caveatTitle: '交锋数据说明',
      caveat: 'P2 基线数据包中的 H2H 样本有限，因此本页展示归一化对比画像，并明确说明限制，而不是假装拥有完整实时历史。',
    },
    diagnostics: {
      title: '模型诊断',
      subtitle: '基线模型自检：回测指标、校准、特征重要性与限制。',
      calibration: '校准曲线',
      featureImportance: '特征重要性',
      causalityNote: '聚合重要性不代表对赛果的因果影响。',
      registry: '模型登记',
      version: '版本',
      layer: '层级',
      trainedAt: '训练时间',
      featureHash: '特征哈希',
      marketSignal: '市场信号：已停用（P2 默认）。MLflow 登记以本地基线版本元数据表示；不声称生产登记提升。',
    },
    quality: {
      title: '数据质量',
      subtitle: '数据包、新鲜度、回退影响和示例说明。',
      forecastPack: '预测数据包',
      modelSummary: '模型摘要',
      packAge: '数据包年龄',
      sourceFreshness: '数据源新鲜度',
      fallbackImpact: '回退影响',
      affectedForecasts: '查看受影响预测 →',
      hashCoverage: 'Manifest 哈希覆盖',
      hashText: '个 JSON 文件列出 sha256，并由 pnpm validate:data 校验，包含所有页面、赛事模拟和预测文件。',
    },
    charts: {
      stackedProb: '主胜、平局、客胜的堆叠概率图',
      probabilitiesTable: '结果概率表',
      heatmap: '六乘六比分概率热力图',
      mostLikelyScore: '最可能比分：',
      scorelineTable: '高概率比分',
      rank: '排名',
      scoreline: '比分',
      advancementBars: '冠军与晋级概率条形图',
      radar: '球队强度雷达图',
      calibration: '包含理想对角线的校准曲线',
      predicted: '预测值',
      observed: '观测值',
      noFeatureRows: '当前数据包没有特征重要性行。图表明确停用，而不是显示空白。',
      featureTable: '主要特征重要性值',
    },
    bracket: {
      title: '淘汰路径',
      round: '轮次',
      finalPath: '决赛路径',
      semiFinal: '半决赛',
      quarterFinal: '四分之一决赛',
      upper: '半决赛席位 · 上半区',
      lower: '半决赛席位 · 下半区',
      champion: '冠军',
      fallback: '文字淘汰路径',
      roundSlot: '轮次席位',
      mostLikely: '最高冠军概率：',
      note: '这是来自静态 Monte Carlo 输出的基线路径视图。',
    },
  },
  en: {
    nav: {
      overview: 'Overview', competitions: 'Competitions', matchPredictor: 'Match Research', tournamentSimulator: 'Tournament Simulator', teamComparison: 'Team Comparison', modelDiagnostics: 'Model Diagnostics', dataQuality: 'Data Quality'
    },
    common: {
      systemHealthy: 'System healthy', systemStale: 'Data needs attention', truth: 'Truth', pack: 'Pack', model: 'Model', confidence: 'Confidence', freshness: 'Freshness', sampleOnly: 'SAMPLE_ONLY sample data', notBettingAdvice: 'Not betting advice', marketOddsNotUsed: 'Market odds not used', dataResearchOnly: 'Research analysis only; not betting advice.', openCompetition: 'Open competition →', viewDiagnostics: 'View diagnostics →', generated: 'generated', warnings: 'warnings', high: 'High', med: 'Med', low: 'Low', light: 'Light', dark: 'Dark', language: 'Language', theme: 'Theme', chinese: '中文', english: 'English', home: 'Home', draw: 'Draw', away: 'Away', probability: 'Probability', team: 'Team', advance: 'Advance', champion: 'Champion', disabled: 'Disabled', ready: 'Ready'
    },
    overview: {
      title: 'Forecast Research Overview', subtitle: 'Competition-first static forecast dashboard; probabilities, truth mode, confidence, model health, and data quality stay visible together.', metricsLabel: 'Five key research status metrics', system: 'System', systemText: 'Static export + data pack loaded', truthText: 'Fallback/sample states stay amber', models: 'Models', scopes: 'scopes', lastPack: 'Last pack', sources: 'Sources', sourceText: 'fresh', competitionFocus: 'Browse by competition', competitionFocusText: 'Start from World Cup 2026, Premier League, Champions League, and similar competitions to review overview, match forecasts, simulation, and data state.', topResearchCases: 'Key research fixtures', uncertaintyWatch: 'Uncertainty and sample warnings', limitedCoverage: 'Limited fixture coverage in this SAMPLE_ONLY pack; no production confidence is implied.', featuredCompetitions: 'Featured competitions', modelHealth: 'Model health', modelHealthText: 'Backtest metrics and calibration are available in Model Diagnostics. Current model version: ', dataPackSnapshot: 'Data pack snapshot', fallbackNote: 'Fallback/sample states are amber and never treated as real-data success.'
    },
    competitions: {
      title: 'Competition Hub', subtitle: 'Use competitions as the primary entry point. Each page summarizes format, data state, forecasts, and simulation availability.', tournament: 'Tournament', league: 'League', snapshot: 'Competition snapshot', fixtures: 'Fixtures & predictions', detailSubtitle: 'Fixtures & predictions · ensemble baseline with Elo/Poisson/fallback calibration.', snapshotPrefix: 'Format', scope: 'Scope', source: 'Source', sampleBaseline: 'The current pack is a SAMPLE_ONLY baseline and is not a real-source prediction product.', simulatorAvailable: 'Simulation available', predictionsAvailable: 'Match forecasts available', dataState: 'Data state', researchNote: 'Research note'
    },
    match: {
      title: 'Match Forecast Research', subtitle: 'Static lookup. No odds. Not betting advice.', selector: 'Research selector', competition: 'Competition', season: 'Season', homeTeam: 'Home team', awayTeam: 'Away team', run: 'Run static lookup', disabledState: 'Disabled >72h; showing last-known data.', readyState: 'Ready.', sourceState: 'Confidence & source state', probabilityChart: 'Win / Draw / Away probability', heatmap: 'Scoreline heatmap', topDrivers: 'Top descriptive drivers', driverNote: 'Driver impact is descriptive and does not imply causality.', xgExtras: 'Expected goals & extras', caveat: 'Caveat: SAMPLE_ONLY baseline data. Market odds are not used. Lineups are not used. Treat as a low-confidence research sample and not as betting advice.', parseFailed: 'Forecast pack parse failed. Showing no match because no last-known fixture is available in this static build.'
    },
    tournament: { title: 'Tournament Simulator', subtitle: 'Static Monte Carlo baseline. Mobile uses round selector.', advancement: 'Advancement probability', noSimulation: 'No tournament simulation available for this competition. This is an explicit disabled state for the static pack.', limited: 'Limited data: SAMPLE_ONLY, {count} teams. Baseline bracket evidence, not production coverage.' },
    team: { title: 'Team Comparison', subtitle: 'Baseline normalized strengths from the static pack; no live roster or odds signals.', context: 'Static sample context', radar: 'Strength radar', recentForm: 'Recent form timeline', caveatTitle: 'Head-to-head caveat', caveat: 'The P2 baseline pack has limited sample H2H rows, so this page shows normalized comparison profiles and an explicit caveat instead of pretending full live history exists.' },
    diagnostics: { title: 'Model Diagnostics', subtitle: 'Baseline model self-checks: backtest metrics, calibration, feature importance, and limitations.', calibration: 'Calibration curve', featureImportance: 'Feature importance', causalityNote: 'Aggregated importance does not imply causal effect on outcomes.', registry: 'Model registry', version: 'Version', layer: 'Layer', trainedAt: 'Trained at', featureHash: 'Feature hash', marketSignal: 'Market signal: disabled (P2 default). MLflow registry is represented as local baseline version metadata; no production registry promotion is claimed.' },
    quality: { title: 'Data Quality', subtitle: 'Pack, freshness, fallback impact, sample notes.', forecastPack: 'Forecast pack', modelSummary: 'Model summary', packAge: 'Pack age', sourceFreshness: 'Source freshness', fallbackImpact: 'Fallback impact', affectedForecasts: 'View affected forecasts →', hashCoverage: 'Manifest hash coverage', hashText: 'JSON files are listed with sha256 and validated by pnpm validate:data, including every page JSON and tournament/prediction file.' },
    charts: { stackedProb: 'Stacked home draw away probability chart', probabilitiesTable: 'Outcome probabilities', heatmap: 'Six by six scoreline probability heatmap', mostLikelyScore: 'Most likely scoreline: ', scorelineTable: 'Top scoreline probabilities', rank: 'Rank', scoreline: 'Scoreline', advancementBars: 'Champion and advancement probability bars', radar: 'Team strength radar chart', calibration: 'Calibration curve with ideal diagonal', predicted: 'Predicted', observed: 'Observed', noFeatureRows: 'No feature importance rows in this data pack. The chart is disabled rather than shown as blank.', featureTable: 'Top feature importance values' },
    bracket: { title: 'Bracket progression', round: 'Round', finalPath: 'Final path', semiFinal: 'Semi-final', quarterFinal: 'Quarter-final', upper: 'Semi finalist · upper', lower: 'Semi finalist · lower', champion: 'Champion', fallback: 'Bracket text fallback', roundSlot: 'Round slot', mostLikely: 'Most likely champion: ', note: 'This is a baseline progression view from static Monte Carlo outputs.' }
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function translateConfidence(value: string, t: Dictionary): string {
  if (value === 'HIGH') return t.common.high;
  if (value === 'MED') return t.common.med;
  if (value === 'LOW') return t.common.low;
  return value;
}

export function formatCompetitionName(name: string, locale: Locale): string {
  if (locale === 'en') return name;
  const map: Record<string, string> = {
    'FIFA World Cup 2026': '2026 世界杯',
    'English Premier League': '英格兰超级联赛',
    'UEFA Champions League': '欧洲冠军联赛',
  };
  return map[name] ?? name;
}

export function formatCompetitionFormat(format: string, locale: Locale): string {
  if (locale === 'en') return format;
  if (format === 'tournament') return '杯赛 / 锦标赛';
  if (format === 'league') return '联赛';
  return format;
}

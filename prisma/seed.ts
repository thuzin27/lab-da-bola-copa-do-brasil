import { syncJogos } from '../src/lib/sync'

async function main() {
  console.log('Seed: buscando dados reais da Copa do Brasil 2026...')
  const result = await syncJogos()
  console.log(`Seed completo: ${result.criados} criados, ${result.atualizados} atualizados`)
  console.log('Por fase:', result.porFase)
}

main()
  .catch((e) => {
    console.error('Seed falhou:', e instanceof Error ? e.message : e)
    process.exit(1)
  })

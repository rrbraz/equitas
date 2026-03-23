# Checklist Curto De PR E Revisão

Antes de pedir revisão:

- rodar `npm run check`
- confirmar que o CI passou
- validar manualmente o fluxo principal tocado pela mudança
- confirmar que não houve acoplamento novo entre features sem contrato explícito
- atualizar docs, env ou schema quando a mudança exigir

Durante a revisão:

- procurar regressão funcional antes de discutir estilo
- conferir estados de erro, loading e vazio quando houver fluxo assíncrono
- priorizar clareza da solução e simplicidade de manutenção

# Labels de triagem

As skills falam em cinco papéis canônicos de triagem. Este repo usa o namespace `status:` para estados de workflow, então cada papel mapeia para a label `status:*` correspondente.

| Papel canônico (skills) | Label no repo | Significado |
| ----------------------- | ----------------------- | --------------------------------------------------- |
| `needs-triage`          | `status:needs-triage`   | Mantenedor precisa avaliar a issue |
| `needs-info`            | `status:needs-info`     | Esperando informação do autor/reporter |
| `ready-for-agent`       | `status:ready-for-agent`| Especificada, pronta para um agente AFK pegar |
| `ready-for-human`       | `status:hitl`           | Requer humano nas bordas (secrets, DNS, produção) |
| `wontfix`               | `status:wontfix`        | Não será implementada |

Quando uma skill cita um papel (ex.: "aplique a label de pronto-para-AFK"), use a string da coluna do meio.

`status:blocked` (bloqueada por dependência/borda externa) é um estado de workflow ortogonal — não faz parte da máquina de triagem de entrada, mas convive no mesmo namespace.

As demais famílias (`type:`, `area:`, `boundary:`, `phase:`) classificam tipo de mudança, área de código, boundary de domínio e fase — são ortogonais à triagem e as skills não as substituem.

'use client'

import { FC } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the CounterProgram component with SSR disabled
const DynamicCounterProgram = dynamic(
  () => import('./CounterProgramClient').then((mod) => mod.default),
  { ssr: false }
)

const CounterProgram: FC = () => {
  return <DynamicCounterProgram />
}

export default CounterProgram


"use client"

import { useParams } from 'next/navigation'
// import Loading from './loading';

export default function Scrapbook() {
  const params = useParams();
  const { recordID } = params;
  return (
    <>
      <p>Hello world, {recordID} </p>
      {/* <Loading /> */}
    </>
  )
}
import React from 'react'
import Hero from '../components/Hero'
import Collection from '../components/LatestCollections'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsLatterBox from '../components/NewsLatterBox'

const Home = () => {
  return (
    <div>
      <Hero/>
      <Collection/>
      <BestSeller/>
      <OurPolicy/>
      <NewsLatterBox/>
    </div>
  )
}

export default Home

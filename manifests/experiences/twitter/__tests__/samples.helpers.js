export const adImpressions = [
  {
    ad: {
      adsUserData: {
        adImpressions: {
          impressions: [
            {
              deviceInfo: {
                osType: 'Desktop'
              },
              displayLocation: 'TimelineHome',
              promotedTweetInfo: {
                tweetId: '1369584490276741122',
                tweetText:
                  '30 Photos Taken In Dubai That Will Destroy Your Stereotypes..',
                urls: [],
                mediaUrls: []
              },
              advertiserInfo: {
                advertiserName: 'Illumeably',
                screenName: '@illumeably'
              },
              matchedTargetingCriteria: [
                {
                  targetingType: 'Platforms',
                  targetingValue: 'Desktop'
                },
                {
                  targetingType: 'Languages',
                  targetingValue: 'English'
                }
              ],
              impressionTime: '2021-04-15 19:51:50'
            }
          ]
        }
      }
    }
  }
]

export const adEngagements = [
  {
    ad: {
      adsUserData: {
        adEngagements: {
          engagements: [
            {
              impressionAttributes: {
                deviceInfo: {
                  osType: 'Android'
                },
                displayLocation: 'TimelineHome',
                promotedTweetInfo: {
                  tweetId: '1381646278988292098',
                  tweetText:
                    '#TrustInTransformation: place your trust in a partner who can help you complete the future-forward transformation into a data-driven company. #CustomerCentricTransformation',
                  urls: [],
                  mediaUrls: []
                },
                advertiserInfo: {
                  advertiserName: 'PwC Switzerland',
                  screenName: '@PwC_Switzerland'
                },
                matchedTargetingCriteria: [
                  {
                    targetingType: 'Locations',
                    targetingValue: 'Switzerland'
                  },
                  {
                    targetingType: 'Age',
                    targetingValue: '35 and up'
                  }
                ],
                impressionTime: '2021-04-15 19:43:20'
              },
              engagementAttributes: [
                {
                  engagementTime: '2021-04-15 19:43:31',
                  engagementType: 'CardUrlClick'
                }
              ]
            }
          ]
        }
      }
    }
  }
]

export const adsItemsExpected = [
  {
    id: 0,
    tweetId: '1369584490276741122',
    advertiserName: 'Illumeably',
    time: '2021-04-15 19:51:50',
    engagement: 0
  },
  {
    id: 1,
    tweetId: '1381646278988292098',
    advertiserName: 'PwC Switzerland',
    time: '2021-04-15 19:43:20',
    engagement: 1
  }
]

export const targetingItemsExpected = [
  {
    id: 0,
    adId: 0,
    targetingType: 'Platforms',
    targetingValue: 'Desktop'
  },
  {
    id: 1,
    adId: 0,
    targetingType: 'Languages',
    targetingValue: 'English'
  },
  {
    id: 2,
    adId: 1,
    targetingType: 'Locations',
    targetingValue: 'Switzerland'
  },
  {
    id: 3,
    adId: 1,
    targetingType: 'Age',
    targetingValue: '35 and up'
  }
]

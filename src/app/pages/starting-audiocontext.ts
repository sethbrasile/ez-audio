import { inlineCode } from '../utils'
import { setupPlayButton } from './play-button'

const Content = {
  setup() {
    setupPlayButton(document.querySelector<HTMLButtonElement>('#play')!)
  },
  html: `
<h1>Starting the AudioContext</h1>

<p>
  I'd like to explain the two patterns for starting the audio context,
  that I've observed emerging during development of this project:
</p>

<i><small>Note: If you'd like to skip the explanation and just see relevant code, compare the difference between the two
keyboard examples: <a href="/ez-audio/sound-fonts">sound-fonts</a> and <a href="/ez-audio/synthesis">synthesis</a></small></i>

<h2>Pattern 1: Obtain permission to start the AudioContext</h2>
<p>
  This pattern is the simplest to implement. You just ask the user for permission to start the AudioContext,
  and then you start it with ${inlineCode('initAudio')}. Place an "alert" asking for permission at a top level
  and then place code that hides the alert behind the promise that comes from the ${inlineCode('initAudio')} method.
  Clearly state to the user that audio buttons won't work until they click the button.
</p>
<p>
  Anywhere in your code that needs the AudioContext can assume it's started because the user is now responsible for starting the
  ${inlineCode('AudioContext')}.
</p>
<p>
  You can see an example of this pattern on the <a href="/ez-audio/sound-fonts">sound-fonts</a> page. If you don't
  see a banner upon navigation asking you to init the AudioContext, you must have already initialized it. Refresh the page to
  see the banner.
</p>
<p>
  From a UX perspective, this pattern will not work in many contexts, but I could see it being the correct choice for developing
  a DAW or something like that.
</p>

<h2>Pattern 2: Quietly start the AudioContext upon user interaction</h2>
<p>
  This pattern obviously carries the benefit of not having to explicitly ask for permission to start the
  AudioContext. This will look more seamless to the end user.
</p>
<p>
  The downside is that since you don't know in many cases which action your end user will take
  first, you must make your calling code much more complex. Every single action that could possibly need the
  AudioContext must assume the audio context is not started and handle the user's first interaction.
</p>
<p>
  You can see an example of the higher complexity of this pattern on the <a href="/ez-audio/synthesis">synthesis</a> page.
  Scroll down to the "full code" section at the bottom.
</p>
<p>
  The basic gist of the problem is that you will end up placing all of your actual business logic inside of event listeners that
  aren't connected to anything on page load, and you have to create intermediate event listeners to set up those listeners and
  remove themselves upon user interaction. It's not that bad, but I couldn't imagine building a DAW with this pattern lol.
</p>
<p>
  Also important to note that you should carefully consider purposefully creating sounds in advance, even though they create
  a warning in the console. I suggest this because if you don't and you are loading in assets such as sound files, there will
  be a noticeable delay before the user's first interaction creates actual sound out of their speakers. If you create the
  sounds in advance, the audio files will have already loaded by the time the user makes an interaction and will hopefully make
  the experience more seamless.
</p>
<p>
  The index page of this site is a straight up lie because it's glossing
  over the fact that the audiocontext needs to be started before it's true. Most pages on this example site use the "permission"
  pattern because it's easier to explain what's going on.
</p>
<p>From a UX perspective, this is generally going to be the better choice.</p>

<h2>Which pattern should I use?</h2>

<p>
  If you need your end user to have a seamless experience and your user shouldn't need to worry about this,
  such as a one-off instrument, a music player, a general UI that includes sound effects, etc... Then you should
  use Pattern 2 and deal with the complexity.
</p>

<p>
  If you're building a DAW or something that requires the end user to have a more explicit understanding of what's going on,
  or your target audience is a developer, then you should use Pattern 1 and ask for permission.
</p>

<p>
  You could also use a hybrid approach and use Pattern 2 at the outset and gate the rest of your app behind whether
  the AudioContext has been started.
</p>
`,
}
export default Content

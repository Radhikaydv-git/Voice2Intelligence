import assemblyai as aai
def transcribe_audio(file_path: str) -> list:
    """
    Returns diarized utterances WITHOUT role assumptions
    """
    config = aai.TranscriptionConfig(
        speaker_labels=True,
        speakers_expected=2
    )

    transcript = aai.Transcriber().transcribe(file_path, config=config)

    if transcript.status == aai.TranscriptStatus.error:
        raise RuntimeError(transcript.error)

    utterances = []
    for u in transcript.utterances:
        utterances.append({
            "speaker": u.speaker,   # A / B
            "text": u.text
        })

    return utterances

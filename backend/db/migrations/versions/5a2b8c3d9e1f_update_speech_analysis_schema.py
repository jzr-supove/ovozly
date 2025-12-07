"""Update speech analysis schema for persistent storage

Revision ID: 5a2b8c3d9e1f
Revises: 4bb7c2e9c8da

This migration updates the speech_analysis and related tables to properly
store all analysis data from OpenAI in PostgreSQL instead of Redis.

Changes:
- speech_analysis: Add sentiment, summary fields, raw_diarization JSONB, fix transcript type
- extracted_entities: Rename 'name' to 'entity_type'
- identified_issues: Rename 'name' to 'issue_type'
- recommended_actions: Rename 'name' to 'action_type'
- call_keypoints: Replace name/value/confidence with single 'point' field
- Add CASCADE delete on foreign keys
- Add unique constraint on speech_analysis.call_id
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '5a2b8c3d9e1f'
down_revision: Union[str, None] = '4bb7c2e9c8da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # speech_analysis: Add new columns and fix transcript type
    op.add_column('speech_analysis', sa.Column('raw_diarization', postgresql.JSONB(), nullable=True))
    op.add_column('speech_analysis', sa.Column('customer_sentiment', sa.String(), nullable=True))
    op.add_column('speech_analysis', sa.Column('agent_sentiment', sa.String(), nullable=True))
    op.add_column('speech_analysis', sa.Column('overall_sentiment', sa.String(), nullable=True))
    op.add_column('speech_analysis', sa.Column('call_efficiency', sa.String(), nullable=True))
    op.add_column('speech_analysis', sa.Column('resolution_status', sa.String(), nullable=True))

    # Change transcript from Integer to Text
    op.alter_column('speech_analysis', 'transcript',
                    existing_type=sa.Integer(),
                    type_=sa.Text(),
                    nullable=False,
                    postgresql_using='transcript::text')

    # Add unique constraint on call_id (one analysis per call)
    op.create_unique_constraint('uq_speech_analysis_call_id', 'speech_analysis', ['call_id'])

    # extracted_entities: Rename 'name' to 'entity_type', make confidence nullable
    op.alter_column('extracted_entities', 'name', new_column_name='entity_type')
    op.alter_column('extracted_entities', 'confidence_score',
                    existing_type=sa.Double(),
                    nullable=True)

    # identified_issues: Rename 'name' to 'issue_type', change description to Text
    op.alter_column('identified_issues', 'name', new_column_name='issue_type')
    op.alter_column('identified_issues', 'description',
                    existing_type=sa.String(),
                    type_=sa.Text())

    # recommended_actions: Rename 'name' to 'action_type'
    op.alter_column('recommended_actions', 'name', new_column_name='action_type')

    # call_keypoints: Replace name/value/confidence with single 'point' field
    op.add_column('call_keypoints', sa.Column('point', sa.Text(), nullable=True))

    # Migrate existing data if any (combine name and value into point)
    op.execute("""
        UPDATE call_keypoints
        SET point = COALESCE(name, '') || ': ' || COALESCE(value, '')
        WHERE point IS NULL
    """)

    # Make point not nullable and drop old columns
    op.alter_column('call_keypoints', 'point', nullable=False)
    op.drop_column('call_keypoints', 'name')
    op.drop_column('call_keypoints', 'value')
    op.drop_column('call_keypoints', 'confidence_score')

    # Update foreign keys with CASCADE delete
    # detected_intents
    op.drop_constraint('detected_intents_analysis_id_fkey', 'detected_intents', type_='foreignkey')
    op.create_foreign_key('detected_intents_analysis_id_fkey', 'detected_intents', 'speech_analysis',
                          ['analysis_id'], ['id'], ondelete='CASCADE')
    op.alter_column('detected_intents', 'analysis_id', nullable=False)

    # extracted_entities
    op.drop_constraint('extracted_entities_analysis_id_fkey', 'extracted_entities', type_='foreignkey')
    op.create_foreign_key('extracted_entities_analysis_id_fkey', 'extracted_entities', 'speech_analysis',
                          ['analysis_id'], ['id'], ondelete='CASCADE')
    op.alter_column('extracted_entities', 'analysis_id', nullable=False)

    # identified_issues
    op.drop_constraint('identified_issues_analysis_id_fkey', 'identified_issues', type_='foreignkey')
    op.create_foreign_key('identified_issues_analysis_id_fkey', 'identified_issues', 'speech_analysis',
                          ['analysis_id'], ['id'], ondelete='CASCADE')
    op.alter_column('identified_issues', 'analysis_id', nullable=False)

    # recommended_actions
    op.drop_constraint('recommended_actions_analysis_id_fkey', 'recommended_actions', type_='foreignkey')
    op.create_foreign_key('recommended_actions_analysis_id_fkey', 'recommended_actions', 'speech_analysis',
                          ['analysis_id'], ['id'], ondelete='CASCADE')
    op.alter_column('recommended_actions', 'analysis_id', nullable=False)

    # call_keypoints
    op.drop_constraint('call_keypoints_analysis_id_fkey', 'call_keypoints', type_='foreignkey')
    op.create_foreign_key('call_keypoints_analysis_id_fkey', 'call_keypoints', 'speech_analysis',
                          ['analysis_id'], ['id'], ondelete='CASCADE')
    op.alter_column('call_keypoints', 'analysis_id', nullable=False)


def downgrade() -> None:
    # Restore call_keypoints columns
    op.add_column('call_keypoints', sa.Column('name', sa.String(), nullable=True))
    op.add_column('call_keypoints', sa.Column('value', sa.String(), nullable=True))
    op.add_column('call_keypoints', sa.Column('confidence_score', sa.Double(), nullable=True))
    op.drop_column('call_keypoints', 'point')

    # Restore foreign keys without CASCADE
    op.drop_constraint('call_keypoints_analysis_id_fkey', 'call_keypoints', type_='foreignkey')
    op.create_foreign_key('call_keypoints_analysis_id_fkey', 'call_keypoints', 'speech_analysis',
                          ['analysis_id'], ['id'])
    op.alter_column('call_keypoints', 'analysis_id', nullable=True)

    op.drop_constraint('recommended_actions_analysis_id_fkey', 'recommended_actions', type_='foreignkey')
    op.create_foreign_key('recommended_actions_analysis_id_fkey', 'recommended_actions', 'speech_analysis',
                          ['analysis_id'], ['id'])
    op.alter_column('recommended_actions', 'analysis_id', nullable=True)

    op.drop_constraint('identified_issues_analysis_id_fkey', 'identified_issues', type_='foreignkey')
    op.create_foreign_key('identified_issues_analysis_id_fkey', 'identified_issues', 'speech_analysis',
                          ['analysis_id'], ['id'])
    op.alter_column('identified_issues', 'analysis_id', nullable=True)

    op.drop_constraint('extracted_entities_analysis_id_fkey', 'extracted_entities', type_='foreignkey')
    op.create_foreign_key('extracted_entities_analysis_id_fkey', 'extracted_entities', 'speech_analysis',
                          ['analysis_id'], ['id'])
    op.alter_column('extracted_entities', 'analysis_id', nullable=True)

    op.drop_constraint('detected_intents_analysis_id_fkey', 'detected_intents', type_='foreignkey')
    op.create_foreign_key('detected_intents_analysis_id_fkey', 'detected_intents', 'speech_analysis',
                          ['analysis_id'], ['id'])
    op.alter_column('detected_intents', 'analysis_id', nullable=True)

    # Restore recommended_actions column name
    op.alter_column('recommended_actions', 'action_type', new_column_name='name')

    # Restore identified_issues
    op.alter_column('identified_issues', 'issue_type', new_column_name='name')
    op.alter_column('identified_issues', 'description',
                    existing_type=sa.Text(),
                    type_=sa.String())

    # Restore extracted_entities
    op.alter_column('extracted_entities', 'entity_type', new_column_name='name')
    op.alter_column('extracted_entities', 'confidence_score',
                    existing_type=sa.Double(),
                    nullable=False)

    # Drop unique constraint
    op.drop_constraint('uq_speech_analysis_call_id', 'speech_analysis', type_='unique')

    # Restore transcript to Integer (this will lose data!)
    op.alter_column('speech_analysis', 'transcript',
                    existing_type=sa.Text(),
                    type_=sa.Integer(),
                    nullable=False,
                    postgresql_using='0')

    # Drop new columns
    op.drop_column('speech_analysis', 'resolution_status')
    op.drop_column('speech_analysis', 'call_efficiency')
    op.drop_column('speech_analysis', 'overall_sentiment')
    op.drop_column('speech_analysis', 'agent_sentiment')
    op.drop_column('speech_analysis', 'customer_sentiment')
    op.drop_column('speech_analysis', 'raw_diarization')

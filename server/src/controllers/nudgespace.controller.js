import { supabase } from '../config/supabase.js';

const SOCIAL_POST_TYPES = new Set(['status', 'win', 'question', 'idea', 'announcement']);
const U_SPACE_POST_TYPES = new Set(['goal', 'reminder', 'focus']);

const normalizeSpace = (space = 'social') => (space === 'u_space' ? 'u_space' : 'social');

const normalizePostType = (space, postType = '') => {
  const cleanType = String(postType || '').trim().toLowerCase().replace(/\s+/g, '_');
  const allowedTypes = space === 'u_space' ? U_SPACE_POST_TYPES : SOCIAL_POST_TYPES;
  return allowedTypes.has(cleanType) ? cleanType : (space === 'u_space' ? 'goal' : 'status');
};

const getSocialVisibilityScope = (user) => {
  if (user.role === 'hr') return 'people';
  if (user.role === 'manager' && user.department_id) return 'department';
  return 'company';
};

const applyVisibilityFilters = (query, user, space) => {
  if (space === 'u_space') {
    return query.eq('visibility_scope', 'private').eq('author_id', user.id);
  }

  if (user.role === 'admin') {
    return query.in('visibility_scope', ['company', 'people', 'department']);
  }

  if (user.role === 'hr') {
    return query.in('visibility_scope', ['company', 'people']);
  }

  if (user.department_id) {
    return query.or(`visibility_scope.eq.company,visibility_scope.eq.people,and(visibility_scope.eq.department,department_id.eq.${user.department_id})`);
  }

  return query.in('visibility_scope', ['company', 'people']);
};

export const getNudgeSpacePosts = async (req, res) => {
  try {
    const space = normalizeSpace(req.query.space);
    const orgId = req.user.organization_id || req.user.company_id;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'Your account is missing an organization. Complete workspace setup first.'
      });
    }

    let query = supabase
      .from('nudgespace_posts')
      .select('id, space, visibility_scope, post_type, content, department_id, created_at, author:users(id, name, email, role, avatar_url)')
      .eq('organization_id', orgId)
      .eq('space', space)
      .order('created_at', { ascending: false })
      .limit(50);

    query = applyVisibilityFilters(query, req.user, space);

    const { data: posts, error } = await query;
    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Get NudgeSpace posts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve NudgeSpace posts.',
      error: error.message
    });
  }
};

export const createNudgeSpacePost = async (req, res) => {
  try {
    const space = normalizeSpace(req.body.space);
    const content = String(req.body.content || '').trim();
    const postType = normalizePostType(space, req.body.post_type);
    const orgId = req.user.organization_id || req.user.company_id;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'Your account is missing an organization. Complete workspace setup first.'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required.'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'NudgeSpace posts must be 1000 characters or fewer.'
      });
    }

    const visibilityScope = space === 'u_space' ? 'private' : getSocialVisibilityScope(req.user);
    const departmentId = visibilityScope === 'department' || (space === 'u_space' && req.user.department_id)
      ? req.user.department_id
      : null;

    const { data: post, error } = await supabase
      .from('nudgespace_posts')
      .insert([{
        organization_id: orgId,
        department_id: departmentId,
        author_id: req.user.id,
        space,
        visibility_scope: visibilityScope,
        post_type: postType,
        content
      }])
      .select('id, space, visibility_scope, post_type, content, department_id, created_at, author:users(id, name, email, role, avatar_url)')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: space === 'u_space' ? 'Saved to U Space.' : 'Posted to NudgeSpace.',
      post
    });
  } catch (error) {
    console.error('Create NudgeSpace post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create NudgeSpace post.',
      error: error.message
    });
  }
};

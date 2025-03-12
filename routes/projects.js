// routes/projects.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { isAuthenticated } = require('../middleware/auth');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Apply auth middleware to all project routes
router.use(isAuthenticated);

// @route   GET api/projects
// @desc    Get all user's projects
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Use req.user.id from the JWT payload
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post('/', async (req, res) => {
  const { name, transcript_id } = req.body;

  try {
    // Create new project using req.user.id from the JWT payload
    const newProject = new Project({
      name,
      transcript_id,
      user: req.user.id
    });

    // Save project
    const project = await newProject.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check user owns the project using req.user.id from the JWT payload
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', async (req, res) => {
  const { name, transcript_id } = req.body;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check user owns the project using req.user.id from the JWT payload
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update project
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, transcript_id },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check user owns the project using req.user.id from the JWT payload
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await project.remove();
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;